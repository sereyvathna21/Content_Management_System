"use client";

import React, { useEffect, useRef, useState } from "react";
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
    setToast: (toast: { message: string; type: "success" | "error" }) => void;
}

export default function SectionMediaPanel({
    activeSectionData,
    activeSectionReady,
    backendUrl,
    onChanged,
    setToast
}: SectionMediaPanelProps) {
    const { data: session } = useSession();
    
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingMedia, setPendingMedia] = useState<MediaDto | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [savingMedia, setSavingMedia] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [removingMediaId, setRemovingMediaId] = useState<string | null>(null);
    
    const [mediaForm, setMediaForm] = useState({
        position: 4,
        altKm: "",
        altEn: "",
        captionKm: "",
        captionEn: "",
        sortOrder: 0
    });
    
    const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
    const [editingMediaForm, setEditingMediaForm] = useState({
        position: 4,
        altKm: "",
        altEn: "",
        captionKm: "",
        captionEn: "",
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
            altKm: "",
            altEn: "",
            captionKm: "",
            captionEn: "",
            sortOrder: activeSectionData ? getNextSortOrder(activeSectionData.media) : 0
        });
        setEditingMediaForm({
            position: 4,
            altKm: "",
            altEn: "",
            captionKm: "",
            captionEn: "",
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
            setUploadError("Save the section before adding images.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setUploadError("Invalid file type.");
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            setUploadError(`Image too large. Max ${MAX_IMAGE_LABEL}.`);
            return;
        }

        if (!session?.accessToken) {
            setUploadError("Missing access token.");
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
                let message = "Failed to upload image.";
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
            setUploadError(err.message || "Failed to upload image.");
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
            setUploadError("Upload an image first.");
            return;
        }

        const altKm = mediaForm.altKm.trim();
        if (!altKm) {
            setUploadError("Khmer alt text is required.");
            return;
        }

        if (!session?.accessToken) {
            setUploadError("Missing access token.");
            return;
        }

        setSavingMedia(true);
        setUploadError(null);

        try {
            const sortOrder = Number.isFinite(Number(mediaForm.sortOrder)) ? Number(mediaForm.sortOrder) : 0;
            const payload = {
                mediaId: pendingMedia.id,
                position: mediaForm.position,
                captionKm: normalizeText(mediaForm.captionKm),
                captionEn: normalizeText(mediaForm.captionEn),
                altKm,
                altEn: normalizeText(mediaForm.altEn),
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
                let message = "Failed to attach image.";
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
            setMediaForm({
                position: 4,
                altKm: "",
                altEn: "",
                captionKm: "",
                captionEn: "",
                sortOrder: nextSortOrder
            });
            setToast({ message: "Image attached successfully", type: "success" });
            onChanged();
        } catch (err: any) {
            setToast({ message: err.message || "Failed to attach image", type: "error" });
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
                let message = "Failed to remove image.";
                try {
                    const err = await res.json();
                    message = err?.message || err || message;
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                throw new Error(message);
            }

            setToast({ message: "Image removed", type: "success" });
            if (editingMediaId === sectionMediaId) {
                setEditingMediaId(null);
            }
            onChanged();
        } catch (err: any) {
            setToast({ message: err.message || "Failed to remove image", type: "error" });
        } finally {
            setRemovingMediaId(null);
        }
    }

    function beginEditMedia(item: SectionMedia) {
        setEditingMediaId(item.id);
        setEditingMediaForm({
            position: item.position ?? 4,
            altKm: item.altKm || "",
            altEn: item.altEn || "",
            captionKm: item.captionKm || "",
            captionEn: item.captionEn || "",
            sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 0
        });
    }

    function cancelEditMedia() {
        setEditingMediaId(null);
        setEditingMediaForm({
            position: 4,
            altKm: "",
            altEn: "",
            captionKm: "",
            captionEn: "",
            sortOrder: 0
        });
    }

    async function handleUpdateMedia(sectionMediaId: string) {
        if (!activeSectionReady || !activeSectionData) return;
        if (!session?.accessToken) return;

        const altKm = editingMediaForm.altKm.trim();
        if (!altKm) {
            setToast({ message: "Khmer alt text is required.", type: "error" });
            return;
        }

        setUpdatingMediaId(sectionMediaId);

        try {
            const payload = {
                position: editingMediaForm.position,
                captionKm: normalizeText(editingMediaForm.captionKm),
                captionEn: normalizeText(editingMediaForm.captionEn),
                altKm,
                altEn: normalizeText(editingMediaForm.altEn),
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
                let message = "Failed to update image.";
                try {
                    const err = await res.json();
                    message = err?.message || err || message;
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                throw new Error(message);
            }

            setToast({ message: "Image updated", type: "success" });
            cancelEditMedia();
            onChanged();
        } catch (err: any) {
            setToast({ message: err.message || "Failed to update image", type: "error" });
        } finally {
            setUpdatingMediaId(null);
        }
    }

    const sortedMedia = activeSectionData?.media
        ? [...activeSectionData.media].sort((a, b) => a.sortOrder - b.sortOrder)
        : [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">Section Images</h3>
                    <p className="text-xs text-gray-500">Upload and manage images for this section.</p>
                </div>
                <p className="text-xs text-gray-400">PNG/JPG/WEBP/GIF up to {MAX_IMAGE_LABEL}</p>
            </div>

            {!activeSectionReady ? (
                <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    Save this section before attaching images.
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
                            <div className="relative z-20 text-sm text-gray-500">Uploading image...</div>
                        ) : pendingMedia ? (
                            <div className="relative z-20 flex flex-col sm:flex-row items-center gap-4 text-left">
                                <img
                                    src={resolveMediaUrl(backendUrl, pendingMedia.publicUrl)}
                                    alt={pendingFile?.name || "Pending upload"}
                                    className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {pendingFile?.name || "Uploaded image"}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {pendingFile ? formatBytes(pendingFile.size) : "Ready to attach"}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetPendingUpload}
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="relative z-20 text-sm text-gray-500">
                                Click to upload an image.
                            </div>
                        )}
                    </div>

                    {uploadError && (
                        <p className="text-xs text-red-500">{uploadError}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Position</label>
                            <select
                                value={mediaForm.position}
                                onChange={(e) => setMediaForm({ ...mediaForm, position: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                {IMAGE_POSITIONS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Sort Order</label>
                            <input
                                type="number"
                                min={0}
                                value={mediaForm.sortOrder}
                                onChange={(e) => setMediaForm({ ...mediaForm, sortOrder: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Alt Text (Khmer) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={mediaForm.altKm}
                                onChange={(e) => setMediaForm({ ...mediaForm, altKm: e.target.value })}
                                placeholder="សេចក្តីពណ៌នា..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Alt Text (English)</label>
                            <input
                                type="text"
                                value={mediaForm.altEn}
                                onChange={(e) => setMediaForm({ ...mediaForm, altEn: e.target.value })}
                                placeholder="Alt text..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Caption (Khmer)</label>
                            <textarea
                                rows={3}
                                value={mediaForm.captionKm}
                                onChange={(e) => setMediaForm({ ...mediaForm, captionKm: e.target.value })}
                                placeholder="ចំណងជើងរូបភាព..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Caption (English)</label>
                            <textarea
                                rows={3}
                                value={mediaForm.captionEn}
                                onChange={(e) => setMediaForm({ ...mediaForm, captionEn: e.target.value })}
                                placeholder="Caption..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y"
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
                            {savingMedia ? "Attaching..." : "Attach Image"}
                        </button>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-800">Attached Images</h4>
                            <span className="text-xs text-gray-400">{activeSectionData?.media?.length || 0} items</span>
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
                                                    <img src={mediaUrl} alt={item.altKm || "Section image"} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No preview</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                                                                <select
                                                                    value={editingMediaForm.position}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, position: Number(e.target.value) })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                >
                                                                    {IMAGE_POSITIONS.map((p) => (
                                                                        <option key={p.value} value={p.value}>{p.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={editingMediaForm.sortOrder}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, sortOrder: Number(e.target.value) })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text (Khmer) <span className="text-red-500">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    value={editingMediaForm.altKm}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, altKm: e.target.value })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text (English)</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingMediaForm.altEn}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, altEn: e.target.value })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Caption (Khmer)</label>
                                                                <textarea
                                                                    rows={2}
                                                                    value={editingMediaForm.captionKm}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, captionKm: e.target.value })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">Caption (English)</label>
                                                                <textarea
                                                                    rows={2}
                                                                    value={editingMediaForm.captionEn}
                                                                    onChange={(e) => setEditingMediaForm({ ...editingMediaForm, captionEn: e.target.value })}
                                                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y"
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
                                                                {updatingMediaId === item.id ? "Saving..." : "Save"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={cancelEditMedia}
                                                                className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                            <span className="px-2 py-1 rounded-full bg-gray-100">{getPositionLabel(item.position)}</span>
                                                            <span className="px-2 py-1 rounded-full bg-gray-100">Order {item.sortOrder}</span>
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-800 truncate">{item.altKm || "(No Khmer alt text)"}</div>
                                                        {item.captionKm && (
                                                            <div className="text-xs text-gray-500 mt-1 truncate">{item.captionKm}</div>
                                                        )}
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
                                                        Edit
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedia(item.id)}
                                                    disabled={removingMediaId === item.id}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    {removingMediaId === item.id ? "Removing..." : "Remove"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">No images attached yet.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
