"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { EditorSection, MediaDto, SectionMedia } from "../../types/social.types";
import {
    IMAGE_POSITIONS,
    IMAGE_ACCEPT,
    MAX_IMAGE_BYTES,
    MAX_IMAGE_LABEL,
    formatBytes,
    normalizeText,
    resolveMediaUrl,
    getNextSortOrder,
    getPositionLabel
} from "../../lib/utils";

interface SectionMediaPanelProps {
    activeSectionData: EditorSection | null;
    activeSectionReady: boolean;
    backendUrl: string;
    onChanged: () => void;
    filterLang?: "km" | "en";
}

export default function SectionMediaPanel({
    activeSectionData,
    activeSectionReady,
    backendUrl,
    onChanged,
    filterLang
}: SectionMediaPanelProps) {
    const { data: session } = useSession();
    const t = useTranslations("SocialEditor");
    
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingMedia, setPendingMedia] = useState<MediaDto | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [savingMedia, setSavingMedia] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [removingMediaId, setRemovingMediaId] = useState<string | null>(null);
    
    const [mediaForm, setMediaForm] = useState({
        position: 4,
        width: 75,
        language: "KH",
        alt: "",
        sortOrder: 0
    });
    
    const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
    const [editingMediaForm, setEditingMediaForm] = useState({
        position: 4,
        width: 75,
        language: "KH",
        alt: "",
        sortOrder: 0
    });
    const [updatingMediaId, setUpdatingMediaId] = useState<string | null>(null);
    
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setPendingFile(null);
        setPendingMedia(null);
        setUploadingImage(false);
        setSavingMedia(false);
        setUploadError(null);
        setRemovingMediaId(null);
        setEditingMediaId(null);
        setUpdatingMediaId(null);
        setMediaForm({
            position: 4,
            width: 75,
            language: "KH",
            alt: "",
            sortOrder: activeSectionData ? getNextSortOrder(activeSectionData.media) : 0
        });
        setEditingMediaForm({
            position: 4,
            width: 75,
            language: "KH",
            alt: "",
            sortOrder: activeSectionData ? getNextSortOrder(activeSectionData.media) : 0
        });
        if (imageInputRef.current) imageInputRef.current.value = "";
    }, [activeSectionData?.id]);

    function resetPendingUpload() {
        setPendingFile(null);
        setPendingMedia(null);
        setUploadError(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
    }

    async function handleUploadImage(file: File) {
        if (!activeSectionReady) {
            setUploadError(t("media.errors.saveBeforeAdd") || "Save the section before adding images.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setUploadError(t("media.errors.invalidFileType") || "Invalid file type.");
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            setUploadError(t("media.errors.imageTooLarge", { max: MAX_IMAGE_LABEL }) || `Image too large. Max ${MAX_IMAGE_LABEL}.`);
            return;
        }

        if (!session?.accessToken) {
            setUploadError(t("media.errors.missingToken") || "Missing access token.");
            return;
        }

        setUploadingImage(true);
        setUploadError(null);

        try {
            const form = new FormData();
            form.append("file", file);

            const res = await fetch(`${backendUrl}/api/admin/social/media/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${session.accessToken}` },
                body: form
            });

            if (!res.ok) {
                let message = t("media.errors.uploadFailed") || "Failed to upload image.";
                try {
                    const err = await res.json();
                    message = err?.message || err || message;
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                throw new Error(message);
            }

            const data = (await res.json()) as MediaDto;
            setPendingMedia(data);
            setPendingFile(file);
            setMediaForm((prev) => ({
                ...prev,
                sortOrder: activeSectionData ? getNextSortOrder(activeSectionData.media) : prev.sortOrder
            }));
        } catch (err: any) {
            setUploadError(err.message || (t("media.errors.uploadFailed") || "Failed to upload image."));
        } finally {
            setUploadingImage(false);
        }
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        handleUploadImage(file);
        if (imageInputRef.current) imageInputRef.current.value = "";
    }

    async function handleAttachMedia() {
        if (!activeSectionReady || !activeSectionData) return;
        if (!pendingMedia) {
            setUploadError(t("media.errors.uploadFirst") || "Upload an image first.");
            return;
        }

        const alt = (mediaForm as any).alt?.trim() ?? "";
        if (!alt) {
            setUploadError(t("media.errors.altKhmerRequired") || "Khmer alt text is required.");
            return;
        }

        if (!session?.accessToken) {
            setUploadError(t("media.errors.missingToken") || "Missing access token.");
            return;
        }

        setSavingMedia(true);
        setUploadError(null);

        try {
            const sortOrder = Number.isFinite(Number(mediaForm.sortOrder)) ? Number(mediaForm.sortOrder) : 0;
            const payload = {
                mediaId: pendingMedia.id,
                position: mediaForm.position,
                // send numeric enum value: 0 = KH, 1 = EN
                language: mediaForm.language === "EN" ? 1 : 0,
                width: mediaForm.width,
                altKm: alt,
                altEn: alt,
                sortOrder
            };

            const res = await fetch(`${backendUrl}/api/admin/social/sections/${activeSectionData.id}/media`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                let message = t("media.errors.attachFailed") || "Failed to attach image.";
                try {
                    const err = await res.json();
                    message = err?.message || err || message;
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                throw new Error(message);
            }

            const nextSortOrder = Number.isFinite(Number(mediaForm.sortOrder)) ? Number(mediaForm.sortOrder) + 1 : 0;
            resetPendingUpload();
            setUploadError(null);
                setMediaForm({
                position: 4,
                width: 75,
                language: "KH",
                alt: "",
                sortOrder: nextSortOrder
            });
            onChanged();
        } catch (err: any) {
            setUploadError(err.message || (t("media.errors.attachFailed") || "Failed to attach image"));
        } finally {
            setSavingMedia(false);
        }
    }

    async function handleRemoveMedia(sectionMediaId: string) {
        if (!activeSectionReady || !activeSectionData) return;
        if (!session?.accessToken) return;

        setRemovingMediaId(sectionMediaId);
        try {
            const res = await fetch(`${backendUrl}/api/admin/social/sections/${activeSectionData.id}/media/${sectionMediaId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${session.accessToken}` }
            });

            if (!res.ok) {
                let message = t("media.errors.removeFailed") || "Failed to remove image.";
                try {
                    const err = await res.json();
                    message = err?.message || err || message;
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                throw new Error(message);
            }

            if (editingMediaId === sectionMediaId) {
                setEditingMediaId(null);
            }
            setUploadError(null);
            onChanged();
        } catch (err: any) {
            setUploadError(err.message || (t("media.errors.removeFailed") || "Failed to remove image"));
        } finally {
            setRemovingMediaId(null);
        }
    }

    function beginEditMedia(item: SectionMedia) {
        setEditingMediaId(item.id);
        setEditingMediaForm({
            position: item.position ?? 4,
            width: item.width ?? 75,
            language: item.language || "KH",
            alt: item.altKm || item.altEn || "",

            sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 0
        });
    }

    function cancelEditMedia() {
        setEditingMediaId(null);
        setEditingMediaForm({
            position: 4,
            width: 75,
            language: "KH",
            alt: "",
            sortOrder: 0
        });
    }

    async function handleUpdateMedia(sectionMediaId: string) {
        if (!activeSectionReady || !activeSectionData) return;
        if (!session?.accessToken) return;

        const alt = (editingMediaForm as any).alt?.trim() ?? "";
        if (!alt) {
            setUploadError(t("media.errors.altKhmerRequired") || "Khmer alt text is required.");
            return;
        }

        setUpdatingMediaId(sectionMediaId);

        try {
            const payload = {
                position: editingMediaForm.position,
                // send numeric enum value: 0 = KH, 1 = EN
                language: editingMediaForm.language === "EN" ? 1 : 0,
                width: editingMediaForm.width,
                altKm: alt,
                altEn: alt,
                sortOrder: Number.isFinite(Number(editingMediaForm.sortOrder)) ? Number(editingMediaForm.sortOrder) : 0
            };

            const res = await fetch(`${backendUrl}/api/admin/social/sections/${activeSectionData.id}/media/${sectionMediaId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                let message = t("media.errors.updateFailed") || "Failed to update image.";
                try {
                    const err = await res.json();
                    message = err?.message || err || message;
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                throw new Error(message);
            }

            cancelEditMedia();
            setUploadError(null);
            onChanged();
        } catch (err: any) {
            setUploadError(err.message || (t("media.errors.updateFailed") || "Failed to update image"));
        } finally {
            setUpdatingMediaId(null);
        }
    }

    const sortedMedia = activeSectionData?.media
        ? [...activeSectionData.media]
            .filter((m) => {
                if (!filterLang) return true;
                return filterLang === "en" ? m.language === "EN" : m.language === "KH";
            })
            .sort((a, b) => a.sortOrder - b.sortOrder)
        : [];

    const getPositionLabelText = (value: number) => {
        const labels: Record<number, string> = {
            0: t("media.position.top") || "Top",
            1: t("media.position.bottom") || "Bottom",
            2: t("media.position.left") || "Left",
            3: t("media.position.right") || "Right",
            4: t("media.position.full") || "Full"
        };
        return labels[value] || getPositionLabel(value);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">{t("media.title") || "Section Images"}</h3>
                    <p className="text-xs text-gray-500">{t("media.subtitle") || "Upload and manage images for this section."}</p>
                </div>
                <p className="text-xs text-gray-400">{t("media.fileHint", { max: MAX_IMAGE_LABEL }) || `PNG/JPG/WEBP/GIF up to ${MAX_IMAGE_LABEL}`}</p>
            </div>

            {!activeSectionReady ? (
                <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    {t("media.saveBeforeAttach") || "Save this section before attaching images."}
                </div>
            ) : (
                <div className="mt-4 space-y-6">
                    <div className="relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 bg-gray-50 border-gray-300">
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept={IMAGE_ACCEPT}
                            onChange={handleImageChange}
                            style={{
                                position: "absolute",
                                inset: 0,
                                opacity: 0,
                                cursor: "pointer",
                                width: "100%",
                                height: "100%",
                                zIndex: 10
                            }}
                        />
                        {uploadingImage ? (
                            <div className="relative z-20 text-sm text-gray-500">{t("media.dropzone.uploading") || "Uploading image..."}</div>
                        ) : pendingMedia ? (
                            <div className="relative z-20 flex flex-col sm:flex-row items-center gap-4 text-left">
                                <img
                                    src={resolveMediaUrl(backendUrl, pendingMedia.publicUrl)}
                                    alt={pendingFile?.name || (t("media.dropzone.pendingAlt") || "Pending upload")}
                                    className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {pendingFile?.name || (t("media.dropzone.uploaded") || "Uploaded image")}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {pendingFile ? formatBytes(pendingFile.size) : (t("media.dropzone.readyToAttach") || "Ready to attach")}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetPendingUpload}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                >
                                    {t("media.dropzone.remove") || "Remove"}
                                </button>
                            </div>
                        ) : (
                            <div className="relative z-20 text-sm text-gray-500">
                                {t("media.dropzone.clickToUpload") || "Click to upload an image."}
                            </div>
                        )}
                    </div>

                    {uploadError && (
                        <p className="text-xs text-red-500">{uploadError}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">{t("media.labels.position") || "Position"}</label>
                            <select
                                value={mediaForm.position}
                                onChange={(e) => setMediaForm({ ...mediaForm, position: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                {IMAGE_POSITIONS.map((p) => (
                                    <option key={p.value} value={p.value}>{getPositionLabelText(p.value)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">{t("media.labels.width") || "Image Width"}</label>
                            <select
                                value={mediaForm.width}
                                onChange={(e) => setMediaForm({ ...mediaForm, width: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value={75}>75%</option>
                                <option value={50}>50%</option>
                                <option value={30}>30%</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">{t("media.labels.language") || "Language"}</label>
                            <select
                                value={mediaForm.language}
                                onChange={(e) => setMediaForm({ ...mediaForm, language: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="KH">Khmer</option>
                                <option value="EN">English</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">{t("media.labels.sortOrder") || "Sort Order"}</label>
                            <input
                                type="number"
                                min={0}
                                value={mediaForm.sortOrder}
                                onChange={(e) => setMediaForm({ ...mediaForm, sortOrder: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">{t("media.labels.alt") || "Alt Text"} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={(mediaForm as any).alt}
                                onChange={(e) => setMediaForm({ ...mediaForm, alt: e.target.value })}
                                placeholder={t("media.placeholders.alt") || "Alt text..."}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                        

                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleAttachMedia}
                            disabled={savingMedia || !pendingMedia}
                            className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {savingMedia ? (t("media.buttons.attaching") || "Attaching...") : (t("media.buttons.attach") || "Attach Image")}
                        </button>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-800">{t("media.list.title") || "Attached Images"}</h4>
                            <span className="text-xs text-gray-400">{t("media.list.count", { count: activeSectionData?.media?.length || 0 }) || `${activeSectionData?.media?.length || 0} items`}</span>
                        </div>
                        {sortedMedia.length ? (
                            <div className="space-y-3">
                                {sortedMedia.map((item) => {
                                    const mediaUrl = resolveMediaUrl(backendUrl, item.media?.publicUrl);
                                    const isEditing = editingMediaId === item.id;
                                    return (
                                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 rounded-lg border border-gray-100 p-3">
                                            <div className="h-20 w-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                                                {mediaUrl ? (
                                                    <img src={mediaUrl} alt={(item.altKm || item.altEn) || (t("media.list.imageAlt") || "Section image")} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">{t("media.list.noPreview") || "No preview"}</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">{t("media.labels.position") || "Position"}</label>
                                                                <select
                                                                    value={editingMediaForm.position}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, position: Number(e.target.value) })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                >
                                                                    {IMAGE_POSITIONS.map((p) => (
                                                                        <option key={p.value} value={p.value}>{getPositionLabelText(p.value)}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">{t("media.labels.width") || "Image Width"}</label>
                                                                <select
                                                                    value={editingMediaForm.width}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, width: Number(e.target.value) })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                >
                                                                    <option value={75}>75%</option>
                                                                    <option value={50}>50%</option>
                                                                    <option value={30}>30%</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">{t("media.labels.language") || "Language"}</label>
                                                                <select
                                                                    value={editingMediaForm.language}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, language: e.target.value })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                >
                                                                    <option value="KH">Khmer</option>
                                                                    <option value="EN">English</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">{t("media.labels.sortOrder") || "Sort Order"}</label>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={editingMediaForm.sortOrder}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, sortOrder: Number(e.target.value) })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">{t("media.labels.alt") || "Alt Text"} <span className="text-red-500">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    value={(editingMediaForm as any).alt}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, alt: e.target.value })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                />
                                                            </div>

                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateMedia(item.id)}
                                                                disabled={updatingMediaId === item.id}
                                                                className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                                            >
                                                                {updatingMediaId === item.id ? (t("media.buttons.saving") || "Saving...") : (t("media.buttons.save") || "Save")}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={cancelEditMedia}
                                                                className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                                                            >
                                                                {t("media.buttons.cancel") || "Cancel"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                            <span className="px-2 py-1 rounded-full bg-gray-100">{getPositionLabelText(item.position)}</span>
                                                            <span className="px-2 py-1 rounded-full bg-gray-100">{t("media.list.order", { order: item.sortOrder }) || `Order ${item.sortOrder}`}</span>
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-800 truncate">{(item.altKm || item.altEn) || (t("media.list.noKhmerAlt") || "(No Khmer alt text)")}</div>
                                                    </>
                                                )}

                                            </div>
                                            <div className="flex items-start gap-2">
                                                {!isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => beginEditMedia(item)}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                                                    >
                                                        {t("media.buttons.edit") || "Edit"}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedia(item.id)}
                                                    disabled={removingMediaId === item.id}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    {removingMediaId === item.id ? (t("media.buttons.removing") || "Removing...") : (t("media.buttons.remove") || "Remove")}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">{t("media.list.empty") || "No images attached yet."}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
