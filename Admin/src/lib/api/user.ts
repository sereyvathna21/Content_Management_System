import axios from "axios";
import { getSession } from "next-auth/react";

export const USER_PROFILE_UPDATED_EVENT = "user-profile-updated";

export type UserProfileUpdatedDetail = Partial<UserProfile>;

export interface UserProfile {
  name: string;
  role: string;
  location: string;
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  country: string;
  city: string;
  postalCode: string;

}

type BackendUserDto = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  avatar?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  bio?: string | null;
  isBlocked?: boolean;
  passwordSet?: boolean;
};

type AvatarUploadResponse = {
  avatarUrl: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001";

const API_BASE_NORMALIZED = API_BASE.replace(/\/$/, "");

const PROFILE_CACHE_TTL_MS = 5000;
let cachedProfile: UserProfile | null = null;
let cachedProfileAt = 0;
let inFlightProfileRequest: Promise<UserProfile> | null = null;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const buildLocation = (city?: string | null, country?: string | null): string => {
  const parts = [city?.trim(), country?.trim()].filter(Boolean);
  return parts.join(", ");
};

const toAbsoluteAssetUrl = (value?: string | null): string => {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_NORMALIZED}${trimmed}`;
  }

  return `${API_BASE_NORMALIZED}/${trimmed}`;
};

const toProfile = (user: BackendUserDto): UserProfile => {
  const { firstName, lastName } = splitName(user.fullName || "");
  const location = buildLocation(user.city, user.country);

  return {
    name: user.fullName || "",
    role: user.role || "",
    location,
    avatar: toAbsoluteAssetUrl(user.avatar) || "/images/user/default-avatar.svg",
    firstName,
    lastName,
    email: user.email || "",
    phone: user.phone || "",
    bio: user.bio || "",
    country: user.country || "",
    city: user.city || "",
    postalCode: user.postalCode || "",

  };
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const session = await getSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchUserData(): Promise<UserProfile> {
  const now = Date.now();
  if (cachedProfile && now - cachedProfileAt < PROFILE_CACHE_TTL_MS) {
    return cachedProfile;
  }

  if (inFlightProfileRequest) {
    return inFlightProfileRequest;
  }

  inFlightProfileRequest = (async () => {
    const headers = await getAuthHeaders();

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await axios.get<BackendUserDto>(`${API_BASE}/api/user/me`, {
          headers,
        });

        const profile = toProfile(response.data);
        cachedProfile = profile;
        cachedProfileAt = Date.now();
        return profile;
      } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const isLastAttempt = attempt === 1;

        if (status !== 503 || isLastAttempt) {
          throw error;
        }

        await wait(300);
      }
    }

    throw new Error("Failed to fetch profile data.");
  })().finally(() => {
    inFlightProfileRequest = null;
  });

  return inFlightProfileRequest;
}

export async function updateUserData(data: Partial<UserProfile>): Promise<void> {
  const headers = await getAuthHeaders();
  const fullName = (
    data.name || [data.firstName, data.lastName].filter(Boolean).join(" ").trim()
  ).trim();
  const hasLocationInput = typeof data.city === "string" || typeof data.country === "string";
  const location = hasLocationInput ? buildLocation(data.city, data.country) : undefined;
  const nextName = fullName || data.name;
  const normalizedAvatar =
    typeof data.avatar === "string" && data.avatar.trim().length > 0
      ? toAbsoluteAssetUrl(data.avatar)
      : data.avatar;

  await axios.put(
    `${API_BASE}/api/user/me`,
    {
      fullName: fullName || undefined,
      email: data.email,
      avatar: normalizedAvatar,
      city: data.city,
      country: data.country,
      postalCode: data.postalCode,

      phone: data.phone,
      bio: data.bio,
      password: undefined,
    },
    { headers }
  );

  if (cachedProfile) {
    const merged: UserProfile = {
      ...cachedProfile,
      ...data,
      avatar: normalizedAvatar ?? cachedProfile.avatar,
      name: nextName || cachedProfile.name,
      location: location ?? cachedProfile.location,
    };
    cachedProfile = merged;
    cachedProfileAt = Date.now();
  }

  if (typeof window !== "undefined") {
    const detail: UserProfileUpdatedDetail = {
      ...data,
    };

    if (normalizedAvatar) {
      detail.avatar = normalizedAvatar;
    }

    if (nextName) {
      detail.name = nextName;
    }

    if (location !== undefined) {
      detail.location = location;
    }

    window.dispatchEvent(
      new CustomEvent<UserProfileUpdatedDetail>(USER_PROFILE_UPDATED_EVENT, { detail })
    );
  }
}

export async function uploadCurrentUserAvatar(file: File): Promise<string> {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<AvatarUploadResponse>(
    `${API_BASE}/api/user/me/avatar`,
    formData,
    { headers }
  );

  const avatarUrl = response.data?.avatarUrl;
  if (!avatarUrl) {
    throw new Error("Avatar URL was not returned by the server.");
  }

  return toAbsoluteAssetUrl(avatarUrl);
}