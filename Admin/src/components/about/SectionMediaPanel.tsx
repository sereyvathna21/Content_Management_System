"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { usePermission } from "@/hooks/usePermission";
import Tooltip from "@/components/ui/Tooltip";
import { Modal } from "@/components/ui/modal";
import { EditorSection, MediaDto, SectionMedia } from "../../types/about.types";
import {
    IMAGE_POSITIONS,
    IMAGE_ACCEPT,
    MAX_IMAGE_BYTES,
    MAX_IMAGE_LABEL,
    formatBytes,
    normalizeText,
    resolveMediaUrl,
    getNextSortOrder,
    getPositionLabel,
    parsePosition,
    parseLanguage
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
    const t = useTranslations("AboutEditor");
    
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
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [editingMediaForm, setEditingMediaForm] = useState({
        position: 4,
        width: 75,
        language: "KH",
        alt: "",
        sortOrder: 0
    });
    const [updatingMediaId, setUpdatingMediaId] = useState<string | null>(null);
    
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const mediaListRef = useRef<HTMLDivElement | null>(null);
    const { can, canAny } = usePermission();
    const canCreateMedia = can("media:create");
    const canUpdateMedia = can("media:update");
    const canDeleteMedia = can("media:delete");
    const canManageMedia = canAny(["media:update", "media:delete"]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            const res = await fetch(`${backendUrl}/api/admin/about/media/upload`, {
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

        const alt = "Image";

        if (!session?.accessToken) {
            setUploadError(t("media.errors.missingToken") || "Missing access token.");
            return;
        }

        setSavingMedia(true);
        setUploadError(null);

        try {
            const sortOrder = activeSectionData ? getNextSortOrder(activeSectionData.media) : 0;
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

            const res = await fetch(`${backendUrl}/api/admin/about/sections/${activeSectionData.id}/media`, {
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

        // Save scroll position of the closest scrollable parent before removing
        const scrollParent = panelRef.current?.closest('.overflow-y-auto') as HTMLElement | null
            || panelRef.current?.closest('[style*="overflow"]') as HTMLElement | null;
        const savedScrollTop = scrollParent?.scrollTop ?? 0;

        setRemovingMediaId(sectionMediaId);
        try {
            const res = await fetch(`${backendUrl}/api/admin/about/sections/${activeSectionData.id}/media/${sectionMediaId}`, {
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

            // Restore scroll position after React re-render
            requestAnimationFrame(() => {
                if (scrollParent) {
                    scrollParent.scrollTop = savedScrollTop;
                }
            });
        } catch (err: any) {
            setUploadError(err.message || (t("media.errors.removeFailed") || "Failed to remove image"));
        } finally {
            setRemovingMediaId(null);
        }
    }

    function beginEditMedia(item: SectionMedia) {
        setEditingMediaId(item.id);
        setEditingMediaForm({
            position: parsePosition(item.position),
            width: item.width ?? 75,
            language: parseLanguage(item.language),
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

        const alt = (editingMediaForm as any).alt?.trim() || "Image";

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

            const res = await fetch(`${backendUrl}/api/admin/about/sections/${activeSectionData.id}/media/${sectionMediaId}`, {
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

    const isEnglish = (lang: string | number) => {
        const v = String(lang).toUpperCase();
        return v === "EN" || v === "1";
    };

    const sortedMedia = activeSectionData?.media
        ? [...activeSectionData.media]
            .filter((item) => filterLang === "en" ? isEnglish(item.language) : !isEnglish(item.language))
            .sort((a, b) => a.sortOrder - b.sortOrder)
        : [];

    const getPositionLabelText = (value: number | string) => {
        const numValue = parsePosition(value);
        const labels: Record<number, string> = {
            0: t("media.position.top") || "Top",
            1: t("media.position.bottom") || "Bottom",
            2: t("media.position.left") || "Left",
            3: t("media.position.right") || "Right",
            4: t("media.position.full") || "Full"
        };
        return labels[numValue] || getPositionLabel(numValue);
    };

    return (
        <div ref={panelRef} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
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
                <div className="mt-4 space-y-5">
                    {/* Upload drop zone */}
                    <div className="relative flex items-center justify-center min-h-[160px] border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 hover:bg-gray-100 bg-gray-50 border-gray-300 hover:border-primary/40 hover:bg-primary/5">
                        {canCreateMedia ? (
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
                        ) : null}
                        {uploadingImage ? (
                            <div className="relative z-20 text-sm text-gray-500">{t("media.dropzone.uploading") || "Uploading image..."}</div>
                        ) : pendingMedia ? (
                            <div className="relative z-20 flex flex-col sm:flex-row items-center gap-4 text-left">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                            <div className="relative z-20 text-sm text-gray-500 pointer-events-none flex flex-col items-center gap-3">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{t("media.dropzone.clickToUpload") || "Click anywhere in this box to upload an image."}</span>
                            </div>
                        )}
                    </div>

                    {uploadError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {uploadError}
                        </p>
                    )}

                    {/* Settings row - compact inline */}
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[100px]">
                            <label className="block text-xs font-medium text-gray-600 mb-1">{t("media.labels.position") || "Position"}</label>
                            <select
                                value={mediaForm.position}
                                onChange={(e) => setMediaForm({ ...mediaForm, position: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                            >
                                {IMAGE_POSITIONS.map((p) => (
                                    <option key={p.value} value={p.value}>{getPositionLabelText(p.value)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[80px]">
                            <label className="block text-xs font-medium text-gray-600 mb-1">{t("media.labels.width") || "Width"}</label>
                            <select
                                value={mediaForm.width}
                                onChange={(e) => setMediaForm({ ...mediaForm, width: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                            >
                                <option value={75}>75%</option>
                                <option value={50}>50%</option>
                                <option value={30}>30%</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[90px]">
                            <label className="block text-xs font-medium text-gray-600 mb-1">{t("media.labels.language") || "Language"}</label>
                            <select
                                value={mediaForm.language}
                                onChange={(e) => setMediaForm({ ...mediaForm, language: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                            >
                                <option value="KH">Khmer</option>
                                <option value="EN">English</option>
                            </select>
                        </div>
                        {canCreateMedia && (
                            <button
                                type="button"
                                onClick={handleAttachMedia}
                                disabled={savingMedia || !pendingMedia}
                                className="px-4 py-1.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                            >
                                {savingMedia ? (t("media.buttons.attaching") || "Attaching...") : (t("media.buttons.attach") || "Attach Image")}
                            </button>
                        )}
                    </div>

                    {/* Attached images list */}
                    <div className="border-t border-gray-100 pt-4" ref={mediaListRef}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-800">{t("media.list.title") || "Attached Images"}</h4>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{sortedMedia.length} {sortedMedia.length === 1 ? 'item' : 'items'}</span>
                        </div>
                        {sortedMedia.length ? (
                            <div className="space-y-2">
                                {sortedMedia.map((item) => {
                                    const mediaUrl = resolveMediaUrl(backendUrl, item.media?.publicUrl);
                                    const isEditing = editingMediaId === item.id;
                                    const langIsEn = isEnglish(item.language);
                                    return (
                                        <div key={item.id} className={`rounded-lg border p-3 transition-all duration-150 ${isEditing ? 'border-primary/30 bg-primary/5 shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}>
                                            <div className="flex gap-3">
                                                {/* Thumbnail */}
                                                <div className="h-14 w-14 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                                                    {mediaUrl ? (
                                                        <>
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={mediaUrl} alt={(item.altKm || item.altEn) || (t("media.list.imageAlt") || "Section image")} className="h-full w-full object-cover" />
                                                        </>
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">{t("media.list.noPreview") || "No preview"}</div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                <select
                                                                    value={editingMediaForm.position}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, position: Number(e.target.value) })}
                                                                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                                                                >
                                                                    {IMAGE_POSITIONS.map((p) => (
                                                                        <option key={p.value} value={p.value}>{getPositionLabelText(p.value)}</option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    value={editingMediaForm.width}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, width: Number(e.target.value) })}
                                                                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                                                                >
                                                                    <option value={75}>75%</option>
                                                                    <option value={50}>50%</option>
                                                                    <option value={30}>30%</option>
                                                                </select>
                                                                <select
                                                                    value={editingMediaForm.language}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, language: e.target.value })}
                                                                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                                                                >
                                                                    <option value="KH">Khmer</option>
                                                                    <option value="EN">English</option>
                                                                </select>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateMedia(item.id)}
                                                                    disabled={updatingMediaId === item.id}
                                                                    className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                                                                >
                                                                    {updatingMediaId === item.id ? (t("media.buttons.saving") || "Saving...") : (t("media.buttons.save") || "Save")}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={cancelEditMedia}
                                                                    className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                                                                >
                                                                    {t("media.buttons.cancel") || "Cancel"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide text-white ${langIsEn ? 'bg-blue-500' : 'bg-red-500'}`}>
                                                                {langIsEn ? 'EN' : 'KH'}
                                                            </span>
                                                            <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-gray-100">{getPositionLabelText(item.position)}</span>
                                                            <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-gray-100">{item.width ?? 75}%</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                {!isEditing && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {canUpdateMedia && (
                                                            <Tooltip label={t("media.buttons.edit") || "Edit"}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => beginEditMedia(item)}
                                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-blue-50 text-blue-500 ring-1 ring-blue-200 hover:bg-blue-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                                                                >
                                                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                            </Tooltip>
                                                        )}
                                                        {canDeleteMedia && (
                                                            <Tooltip label={t("media.buttons.remove") || "Remove"}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeleteConfirmId(item.id)}
                                                                    disabled={removingMediaId === item.id}
                                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-red-50 text-red-500 ring-1 ring-red-200 hover:bg-red-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 ml-1.5"
                                                                >
                                                                    {removingMediaId === item.id ? (
                                                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                                                    ) : (
                                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m4 0V4a2 2 0 012-2h2a2 2 0 012 2v2" /></svg>
                                                                    )}
                                                                </button>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-sm text-gray-400">
                                <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {t("media.list.empty") || "No images attached yet."}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} className="max-w-md p-6">
                <div className="flex flex-col items-center text-center">
                   <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                       <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                       </svg>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">
                       {t("media.confirmDeleteTitle") || "Delete Image"}
                   </h3>
                   <p className="text-sm text-gray-500 mb-6">
                       {t("media.confirmDeleteBody") || "Are you sure you want to delete this attached image? This action cannot be undone."}
                   </p>
                   <div className="flex w-full gap-3">
                       <button
                           type="button"
                           onClick={() => setDeleteConfirmId(null)}
                           className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                       >
                           {t("media.cancel") || "Cancel"}
                       </button>
                       <button
                           type="button"
                           onClick={() => {
                               if (deleteConfirmId) {
                                   handleRemoveMedia(deleteConfirmId);
                                   setDeleteConfirmId(null);
                               }
                           }}
                           className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                       >
                           {t("media.confirmDelete") || "Delete"}
                       </button>
                   </div>
                </div>
            </Modal>
        </div>
    );
}
