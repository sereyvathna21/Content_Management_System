/**
 * Centralized API client for the NSPC CMS.
 * All backend requests go through here — makes it easy to manage
 * auth headers, base URL, and error handling in one place.
 *
 * Usage:
 *   import { api } from "@/app/lib/api";
 *
 *   const articles = await api.get<NewsArticle[]>("/news");
 *   const result   = await api.post<LoginResponse>("/auth/login", { email, password });
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Token helpers ────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function saveToken(token: string): void {
  localStorage.setItem("access_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("access_token");
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface RequestOptions {
  /** Extra headers to merge in. */
  headers?: Record<string, string>;
  /** Pass `true` to skip attaching the Authorization header. */
  public?: boolean;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (!options.public) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // Try to parse a JSON error message from ASP.NET, fall back to status text
    let message = res.statusText;
    try {
      const err = await res.json();
      message = err?.message ?? err?.title ?? message;
    } catch {
      // response wasn't JSON — keep statusText
    }
    throw new Error(`API ${method} ${path} failed (${res.status}): ${message}`);
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Public API object ────────────────────────────────────────────────────────

export const api = {
  /** GET  /api/<path> */
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("GET", path, undefined, options);
  },

  /** POST /api/<path> */
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("POST", path, body, options);
  },

  /** PUT  /api/<path> */
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", path, body, options);
  },

  /** PATCH /api/<path> */
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PATCH", path, body, options);
  },

  /** DELETE /api/<path> */
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("DELETE", path, undefined, options);
  },
};

// ─── Typed endpoint helpers (add more as you build the backend) ───────────────

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string }>("/api/auth/login", { email, password }, { public: true }),

  forgotPassword: (email: string) =>
    api.post<void>("/api/auth/forgot-password", { email }, { public: true }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<void>("/api/auth/reset-password", { token, newPassword }, { public: true }),
};

// News
export const newsApi = {
  getAll: () => api.get<NewsArticle[]>("/api/news"),
  getById: (id: string) => api.get<NewsArticle>(`/api/news/${id}`),
};

// Laws
export const lawsApi = {
  getAll: () => api.get<LawItem[]>("/api/laws"),
  getById: (id: string) => api.get<LawItem>(`/api/laws/${id}`),
};

// Publications
export const publicationsApi = {
  getAll: () => api.get<Publication[]>("/api/publications"),
  getById: (id: number) => api.get<Publication>(`/api/publications/${id}`),
};

// ─── Shared types (keep in sync with ASP.NET DTOs) ───────────────────────────

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  subtitle?: string;
  date: string;
  category: string;
  image: string;
}

export interface LawItem {
  id: string;
  title: string;
  category: string;
  url: string;
  uploadDate?: string;
}

export interface Publication {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  pdf: string;
}
