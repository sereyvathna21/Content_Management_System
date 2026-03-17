// EditUserForm.tsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Image from "next/image";
import AvatarCropper from "@/components/user-management/AvatarCropper";
import PasswordInput from "@/components/form/PasswordInput";

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  password?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (user: UserPayload) => void;
  initial: UserPayload;
}

export default function EditUserForm({ open, onClose, onSave, initial }: Props) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [role, setRole] = useState(initial.role);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.avatar || "/images/user/user-17.jpg");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Add this line at the top of the component

  useEffect(() => {
    setName(initial.name);
    setEmail(initial.email);
    setRole(initial.role);
    setAvatarPreview(initial.avatar || "/images/user/user-17.jpg");
  }, [initial]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email || !name) return;

    // Validate password only if provided
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    onSave({
      id: initial.id,
      name,
      email,
      role,
      avatar: avatarPreview,
      password: password || undefined, // Include password only if provided
    });
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
        <h3 className="text-lg font-semibold text-primary">Edit User</h3>
        <p className="text-sm text-gray-500">Update user details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="text-gray-400">No avatar</div>
              )}
            </div>
            <label className="mt-2 text-xs text-gray-500">Avatar (click image to upload)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            {showCrop && cropSrc && (
              <div className="w-full mt-3">
                <AvatarCropper imageSrc={cropSrc} onCancel={handleCropCancel} onComplete={handleCropComplete} />
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <Select
                value={role}
                onChange={(val) => setRole(val as string)}
                options={[{ label: "Admin", value: "admin" }, { label: "Editor", value: "editor" }, { label: "Viewer", value: "viewer" }]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <PasswordInput
                placeholder="New password (leave blank to keep current)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <PasswordInput
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
          <Button size="sm" type="submit" className="bg-primary text-white hover:bg-primary/60">Save</Button>
        </div>
      </form>
    </Modal>
  );
}