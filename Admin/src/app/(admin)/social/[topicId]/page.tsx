"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import SectionTree, { TreeSection } from "@/components/social/SectionTree";
import SectionForm, { SectionData } from "@/components/social/SectionForm";
import Toast from "@/components/laws/Toast";
import { Modal } from "@/components/ui/modal";

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

type MediaDto = {
    id: string;
    publicUrl: string;
    mimeType: string;
    fileSize: number;
    width?: number;
    height?: number;
};

type SectionMedia = {
    id: string;
    sectionId: string;
    mediaId: string;
    position: number;
    captionKm?: string;
    captionEn?: string;
    altKm?: string;
    altEn?: string;
    sortOrder: number;
    media?: MediaDto | null;
};

type EditorSection = TreeSection & {
    contentKm: string;
    contentEn: string;
    media: SectionMedia[];
};

const IMAGE_POSITIONS = [
    { value: 0, label: "Top" },
    { value: 1, label: "Bottom" },
    { value: 2, label: "Left" },
    { value: 3, label: "Right" },
    { value: 4, label: "Full" },
];

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_LABEL = "5 MB";

function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeText(value: string) {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

function resolveMediaUrl(backendUrl: string, url?: string) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${backendUrl}${url}`;
    return `${backendUrl}/${url}`;
}

function getNextSortOrder(media: SectionMedia[]) {
    if (!media.length) return 0;
    return Math.max(...media.map((item) => item.sortOrder)) + 1;
}

function getPositionLabel(value: number) {
    return IMAGE_POSITIONS.find((p) => p.value === value)?.label ?? "Full";
}

export default function TopicEditorPage() {
    const params = useParams();
    const router = useRouter();
    const topicId = params.topicId as string;
    const { data: session, status } = useSession();
    const t = useTranslations("SocialEditor");
    const locale = useLocale();

    const [topic, setTopic] = useState<any>(null);
    const [sections, setSections] = useState<EditorSection[]>([]);

    // Build a proper tree-order (pre-order traversal) from flat sections
    function buildTreeOrder(flatSections: EditorSection[]): EditorSection[] {
        const result: EditorSection[] = [];
        
        function addChildren(parentId: string | undefined | null) {
            const children = flatSections
                .filter(s => (s.parentSectionId ?? null) === (parentId ?? null))
                .sort((a, b) => a.sortOrder - b.sortOrder);
            for (const child of children) {
                result.push(child);
                addChildren(child.id);
            }
        }
        
        addChildren(null);
        return result;
    }
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ type: "publish" | "rollback" | "deleteSection", payload?: string } | null>(null);
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

    // Derived Data
    const activeSectionData = activeSectionId ? sections.find(s => s.id === activeSectionId) : null;
    const activeSectionReady = !!activeSectionData && !activeSectionId?.startsWith("new-");
    const backendUrl = getBackendUrl().replace(/\/$/, "");
    
    const load = useCallback(async () => {
        if (!topicId || status === "loading" || !session?.accessToken) return;
        setLoading(true);
        try {
            const [topicRes, sectionsRes] = await Promise.all([
                fetch(`${getBackendUrl()}/api/admin/social/topics/${topicId}`, {
                    headers: { "Authorization": `Bearer ${session.accessToken}` }
                }),
                fetch(`${getBackendUrl()}/api/admin/social/topics/${topicId}/sections`, {
                    headers: { "Authorization": `Bearer ${session.accessToken}` }
                })
            ]);

            if (topicRes.ok) setTopic(await topicRes.json());
            if (sectionsRes.ok) {
                const data = await sectionsRes.json();
                const mapped = data.map((s: any) => ({
                    id: s.id,
                    sectionKey: s.sectionKey,
                    titleKm: s.titleKm,
                    titleEn: s.titleEn,
                    contentKm: s.contentKm,
                    contentEn: s.contentEn,
                    sortOrder: s.sortOrder,
                    depth: s.depth,
                    parentSectionId: s.parentSectionId,
                    media: Array.isArray(s.media)
                        ? s.media.map((m: any) => ({
                            id: m.id,
                            sectionId: m.sectionId,
                            mediaId: m.mediaId,
                            position: m.position,
                            captionKm: m.captionKm,
                            captionEn: m.captionEn,
                            altKm: m.altKm,
                            altEn: m.altEn,
                            sortOrder: m.sortOrder,
                            media: m.media ? {
                                id: m.media.id,
                                publicUrl: m.media.publicUrl,
                                mimeType: m.media.mimeType,
                                fileSize: m.media.fileSize,
                                width: m.media.width,
                                height: m.media.height,
                            } : null
                        }))
                        : []
                })) as EditorSection[];
                setSections(buildTreeOrder(mapped));
            }
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to load topic data.", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [topicId, status, session?.accessToken]);

    useEffect(() => {
        load();
    }, [load]);

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
    }, [activeSectionId]);

    // Governance Actions
    async function handlePublish() {
        setConfirmModal(null);
        try {
            const res = await fetch(`${getBackendUrl()}/api/admin/social/topics/${topicId}/publish`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${session?.accessToken}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Missing Khmer validation fields.");
            }
            setToast({ message: t("publishSuccess") || "Published successfully", type: "success" });
            load();
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
        }
    }

    async function handleRollback() {
        setConfirmModal(null);
        try {
            const res = await fetch(`${getBackendUrl()}/api/admin/social/topics/${topicId}/rollback`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${session?.accessToken}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Cannot rollback. Ensure a published version exists.");
            }
            setToast({ message: "Rolled back successfully", type: "success" });
            setActiveSectionId(null);
            setIsFormOpen(false);
            load();
        } catch (err: any) {
             setToast({ message: err.message, type: "error" });
        }
    }

    // Section Mutations
    function handleAddSubSection(parentId: string | null) {
        setActiveSectionId(null);
        // We inject the parentId into an empty initialData structure
        const dummySection: any = { parentSectionId: parentId };
        // We trick the active data via overriding state:
        setActiveSectionId(`new-${parentId || 'root'}`);
        setIsFormOpen(true);
    }

    async function handleSaveSection(data: SectionData) {
        setIsSaving(true);
        try {
            const isEditing = !!data.id;
            const url = isEditing 
                ? `${getBackendUrl()}/api/admin/social/sections/${data.id}`
                : `${getBackendUrl()}/api/admin/social/topics/${topicId}/sections`;

            // If creating new, calculate appropriate parent
            const payload = { ...data };
            if (!isEditing && activeSectionId?.startsWith('new-')) {
                const parentId = activeSectionId.replace('new-', '');
                if (parentId !== 'root') {
                    payload.parentSectionId = parentId;
                }
            }

            const res = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { 
                    "Authorization": `Bearer ${session?.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save section");

            const savedNode = await res.json();
            await load(); // Reload tree to get exact depth/sortOrder from DB
            
            setActiveSectionId(savedNode.id);
            setIsFormOpen(false);
            setToast({ message: "Section saved successfully", type: "success" });
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteSection(id: string) {
        setConfirmModal(null);
        try {
            const res = await fetch(`${getBackendUrl()}/api/admin/social/sections/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${session?.accessToken}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err || "Failed to delete (has children?)");
            }
            if (activeSectionId === id) {
                setIsFormOpen(false);
                setActiveSectionId(null);
            }
            load();
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
        }
    }

    async function handleReorder(sectionId: string, direction: 'up' | 'down') {
        const current = sections.find(s => s.id === sectionId);
        if (!current) return;

        // Only reorder among siblings (sections sharing the same parentSectionId)
        const siblings = sections
            .filter(s => (s.parentSectionId ?? null) === (current.parentSectionId ?? null))
            .sort((a, b) => a.sortOrder - b.sortOrder);

        const siblingIndex = siblings.findIndex(s => s.id === sectionId);
        if (siblingIndex < 0) return;

        const swapSiblingIndex = direction === 'up' ? siblingIndex - 1 : siblingIndex + 1;

        // Bounds checking within siblings
        if (swapSiblingIndex < 0 || swapSiblingIndex >= siblings.length) return;

        const swapSibling = siblings[swapSiblingIndex];

        // Save the payload BEFORE mutating
        const currentNewSortOrder = swapSibling.sortOrder;
        const swapNewSortOrder = current.sortOrder;

        const apiPayload = [
            { sectionId: current.id, sortOrder: currentNewSortOrder },
            { sectionId: swapSibling.id, sortOrder: swapNewSortOrder }
        ];

        // Optimistic UI update
        const newSections = sections.map(s => {
            if (s.id === current.id) return { ...s, sortOrder: currentNewSortOrder };
            if (s.id === swapSibling.id) return { ...s, sortOrder: swapNewSortOrder };
            return s;
        });

        // Sort in tree pre-order (parents followed by their children)
        setSections(buildTreeOrder(newSections));

        // Perform backend sync
        try {
            const res = await fetch(`${getBackendUrl()}/api/admin/social/topics/${topicId}/sections/reorder`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${session?.accessToken}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(apiPayload)
            });
            
            if (!res.ok) {
                throw new Error("Failed to reorder");
            }
            
            setToast({ message: "Section moved successfully", type: "success" });
        } catch (err: any) {
            // Revert on failure by reloading from server
            setToast({ message: err.message || "Failed to reorder sections", type: "error" });
            await load();
        }
    }

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
            await load();
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
            await load();
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
            await load();
        } catch (err: any) {
            setToast({ message: err.message || "Failed to update image", type: "error" });
        } finally {
            setUpdatingMediaId(null);
        }
    }

    if (loading) return <div className="p-6">Loading Topic...</div>;
    if (!topic) return <div className="p-6">Topic not found</div>;

    const currentFormInitialData = activeSectionId?.startsWith('new-') 
        ? null 
        : activeSectionData;
    const sortedMedia = activeSectionData?.media
        ? [...activeSectionData.media].sort((a, b) => a.sortOrder - b.sortOrder)
        : [];

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] p-6 space-y-6 overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <div>
                   <h1 className="text-2xl font-bold text-gray-900">
                       {locale === "en" && topic.titleEn ? topic.titleEn : topic.titleKm}
                   </h1>
                   <p className="text-sm text-gray-500 font-mono">/{topic.slug}</p>
               </div>
               <div className="flex gap-3 items-center">
                   <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600 border border-gray-200">
                       {topic.status === 1 ? "Live" : "Draft"}
                   </div>
                   <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200">
                       Back
                   </button>
                   {topic.status === 0 && (
                       <button onClick={() => setConfirmModal({ type: 'rollback' })} className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 border border-orange-200">
                           {t("rollback") || "Rollback"}
                       </button>
                   )}
                   <button onClick={() => setConfirmModal({ type: 'publish' })} className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md">
                       {t("publish") || "Publish Live"}
                   </button>
               </div>
            </div>

            {/* Split Editor UI */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Left Tree */}
                <div className="w-full lg:w-1/3 shrink-0 flex flex-col h-full">
                   <SectionTree 
                       sections={sections}
                       activeSectionId={activeSectionId?.startsWith('new-') ? null : activeSectionId}
                       onSelect={(id) => {
                           setActiveSectionId(id);
                           setIsFormOpen(true);
                       }}
                       onAddSubSection={handleAddSubSection}
                       onMoveUp={(id) => handleReorder(id, 'up')}
                       onMoveDown={(id) => handleReorder(id, 'down')}
                       onDelete={(id) => setConfirmModal({ type: "deleteSection", payload: id })}
                   />
                </div>

                {/* Right Form */}
                <div className="flex-1 overflow-y-auto pr-2 pb-10">
                    {isFormOpen ? (
                        <div className="space-y-6">
                            <SectionForm 
                               initialData={currentFormInitialData as any}
                               onSave={handleSaveSection}
                               onCancel={() => {
                                   setIsFormOpen(false);
                                   setActiveSectionId(null);
                               }}
                               saving={isSaving}
                            />

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
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 text-center">
                            <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-500">Select a section to edit</p>
                            <p className="text-sm mt-1">Or click "+ Add Root Section" to begin writing content.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modals */}
            <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} className="max-w-md p-6">
                <div>
                   <h3 className="text-lg font-semibold mb-2 text-gray-800">
                       {confirmModal?.type === 'publish' && "Publish Topic"}
                       {confirmModal?.type === 'rollback' && "Rollback Topic"}
                       {confirmModal?.type === 'deleteSection' && "Delete Section"}
                   </h3>
                   <p className="text-sm text-gray-600 mb-6">
                       {confirmModal?.type === 'publish' && "Are you sure you want to publish? This will push all content live immediately."}
                       {confirmModal?.type === 'rollback' && "Are you sure you want to rollback to the last published version? Unsaved draft changes will be lost."}
                       {confirmModal?.type === 'deleteSection' && "Are you sure you want to delete this block? All child blocks will also be deleted. This cannot be undone."}
                   </p>
                   <div className="flex justify-end gap-3">
                       <button
                           className="h-9 px-4 rounded-lg font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                           onClick={() => setConfirmModal(null)}
                       >
                           Cancel
                       </button>
                       <button
                           className={`h-9 px-4 rounded-lg font-semibold text-white transition ${
                               confirmModal?.type === 'publish' ? 'bg-green-600 hover:bg-green-700' :
                               confirmModal?.type === 'rollback' ? 'bg-orange-600 hover:bg-orange-700' :
                               'bg-red-600 hover:bg-red-700'
                           }`}
                           onClick={() => {
                               if (confirmModal?.type === 'publish') handlePublish();
                               if (confirmModal?.type === 'rollback') handleRollback();
                               if (confirmModal?.type === 'deleteSection' && confirmModal.payload) handleDeleteSection(confirmModal.payload);
                           }}
                       >
                           Confirm
                       </button>
                   </div>
                </div>
            </Modal>
        </div>
    );
}
