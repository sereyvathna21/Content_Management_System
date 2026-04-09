"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import AvatarCropper from "../user-management/AvatarCropper";
import {
  fetchUserData,
  uploadCurrentUserAvatar,
  updateUserData,
  USER_PROFILE_UPDATED_EVENT,
  UserProfileUpdatedDetail,
} from "../../lib/api/user";
import type { UserProfile } from "../../lib/api/user";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const t = useTranslations("ProfilePage");
  const [userData, setUserData] = useState<UserProfile>({
    name: "",
    role: "",
    location: "",
    avatar: "/images/user/default-avatar.svg",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    country: "",
    city: "",
    postalCode: "",

  });
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [avatarDraft, setAvatarDraft] = useState<string>("/images/user/default-avatar.svg");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      const data = await fetchUserData();
      setUserData(data);
      setAvatarDraft(data.avatar || "/images/user/default-avatar.svg");
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<UserProfileUpdatedDetail>;
      const detail = customEvent.detail;

      if (!detail) {
        loadUserData();
        return;
      }

      setUserData((prev) => {
        const next = { ...prev, ...detail };
        const locationParts = [next.city?.trim(), next.country?.trim()].filter(Boolean);
        return {
          ...next,
          location: locationParts.join(", "),
        };
      });

      if (detail.avatar) {
        setAvatarDraft(detail.avatar);
      }
    };

    window.addEventListener(USER_PROFILE_UPDATED_EVENT, handleProfileUpdated);

    return () => {
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, handleProfileUpdated);
    };
  }, [loadUserData]);

  const displayName =
    userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(" ");
  const displayRole = userData.role || "Admin";
  const displayLocation = userData.location || t("notAvailable");
  const displayAvatar = userData.avatar || "/images/user/default-avatar.svg";

  const handleAvatarInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = (reader.result as string) || "";
      setCropSrc(result);
      setAvatarDraft(displayAvatar);
      openModal();
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setAvatarDraft(croppedDataUrl);

    try {
      setIsSaving(true);
      const croppedBlob = await fetch(croppedDataUrl).then((response) => response.blob());
      const avatarFile = new File([croppedBlob], `avatar-${Date.now()}.jpg`, {
        type: croppedBlob.type || "image/jpeg",
      });
      const avatarUrl = await uploadCurrentUserAvatar(avatarFile);

      await updateUserData({
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        avatar: avatarUrl,
      });
      setUserData((prev) => ({ ...prev, avatar: avatarUrl }));
      setAvatarDraft(avatarUrl);
      setCropSrc(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      closeModal();
    } catch (error) {
      console.error("Failed to update avatar", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setCropSrc(null);
    setAvatarDraft(userData.avatar || "/images/user/default-avatar.svg");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    closeModal();
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
            <div
              className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border border-gray-200 dark:border-gray-800"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label={t("changeAvatar")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              {displayAvatar.startsWith("data:") || displayAvatar.startsWith("blob:") ? (
                <img src={displayAvatar} alt="user" className="h-full w-full object-cover" />
              ) : (
                <Image width={80} height={80} src={displayAvatar} alt="user" className="h-full w-full object-cover" unoptimized />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-[11px] font-medium text-white transition group-hover:bg-black/45">
                <span className="opacity-0 transition group-hover:opacity-100">{t("edit")}</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarInputChange}
              className="sr-only"
            />
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {displayName || t("unnamedUser")}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm font-semibold text-primary dark:text-gray-400">
                  {displayRole}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {displayLocation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-xl p-6" backdropClassName="fixed inset-0 h-full w-full bg-gray-400/30 backdrop-blur-sm">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">{t("editAvatarTitle")}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("editAvatarDescription")}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
              {avatarDraft.startsWith("data:") || avatarDraft.startsWith("blob:") ? (
                <img src={avatarDraft} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <Image src={avatarDraft} alt="Avatar preview" width={64} height={64} className="h-full w-full object-cover" unoptimized />
              )}
            </div>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              onClick={() => fileInputRef.current?.click()}
            >
              {t("chooseAnotherImage")}
            </button>
          </div>

          {cropSrc ? (
            <AvatarCropper
              imageSrc={cropSrc}
              onCancel={handleCloseModal}
              onComplete={handleCropComplete}
              actionLabel={t("save")}
              loading={isSaving}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {t("selectImageByClick")}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
