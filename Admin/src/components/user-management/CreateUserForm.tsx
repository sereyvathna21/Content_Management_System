// CreateUserForm.tsx
"use client";
import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import PasswordInput from "@/components/form/PasswordInput";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Image from "next/image";
import AvatarCropper from "@/components/user-management/AvatarCropper";

interface UserPayload {
  name: string;
  email: string;
  role: string;
  password: string;
  avatar?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (user: UserPayload) => void;
}

export default function CreateUserForm({ open, onClose, onSave }: Props) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>("/images/user/default-avatar.svg");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const passwordsMismatch = password !== "" && confirmPassword !== "" && password !== confirmPassword;
  const liveError = error || (passwordsMismatch ? t("UserForm.passwordsMismatch") : null);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email || !name || !password) {
      setError(t("UserForm.allFieldsRequired"));
      return;
    }
    if (passwordsMismatch) {
      setError(t("UserForm.passwordsMismatch"));
      return;
    }
    onSave({ name, email, role, password, avatar: avatarPreview ?? undefined });
    onClose();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCropSrc(result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  }

  function handleCropComplete(croppedDataUrl: string) {
    setAvatarPreview(croppedDataUrl);
    setShowCrop(false);
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleCropCancel() {
    setShowCrop(false);
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-xl p-6" backdropClassName="fixed inset-0 h-full w-full bg-gray-400/30 backdrop-blur-sm">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-primary">{t("UserForm.createTitle")}</h3>
        <p className="text-sm text-gray-500">{t("UserForm.createSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="flex flex-col items-center md:items-start md:col-span-1">
            <div
              className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer ring-1 ring-transparent hover:ring-primary/30 transition"
              role="button"
              tabIndex={0}
              aria-label="Upload avatar"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              {avatarPreview ? (
                (() => {
                  const src = (avatarPreview || "").toString().trim();
                  if (src.startsWith("data:") || src.startsWith("blob:")) {
                    return <img src={src} alt="Avatar preview" className="w-full h-full object-cover" />;
                  }
                  return <Image src={src} alt="Avatar preview" width={96} height={96} className="w-full text-center h-full object-cover" />;
                })()
              ) : (
                <div className="text-gray-400">{t("UserForm.noAvatar")}</div>
              )}
            </div>
            <label className="mt-2 text-xs text-gray-500">{t("UserForm.avatarLabel")}</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            {showCrop && cropSrc && (
              <div className="w-full mt-3">
                <AvatarCropper imageSrc={cropSrc} onCancel={handleCropCancel} onComplete={handleCropComplete} />
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("UserForm.fullNameLabel")}</label>
              <Input placeholder={t("UserForm.fullNamePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("UserForm.emailLabel")}</label>
              <Input type="email" placeholder={t("UserForm.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("UserForm.roleLabel")}</label>
              <Select
                value={role}
                onChange={(val) => setRole(val as string)}
                options={[
                  { label: t("UserForm.roleOptions.admin"), value: "admin" },
                  { label: t("UserForm.roleOptions.user"), value: "user" },
                  { label: t("UserForm.roleOptions.superAdmin"), value: "superadmin" },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("UserForm.passwordLabel")}</label>
              <PasswordInput
                placeholder={t("UserForm.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="new-password"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("UserForm.confirmPasswordLabel")}</label>
              <PasswordInput
                placeholder={t("UserForm.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                name="new-password-confirm"
                autoComplete="new-password"
              />
            </div>

            {liveError && <div className="text-sm text-red-600">{liveError}</div>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} size="sm">{t("UserForm.cancel")}</Button>
          <Button size="sm" type="submit" className="bg-primary text-white hover:bg-primary/60">{t("UserForm.save")}</Button>
        </div>
      </form>
    </Modal>
  );
}