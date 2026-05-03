"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { EditorSection, SectionData } from "@/types/social.types";

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

export function useTopicEditor() {
    const params = useParams();
    const router = useRouter();
    const topicId = params.topicId as string;
    const { data: session, status } = useSession();
    const t = useTranslations("SocialEditor");

    const [topic, setTopic] = useState<any>(null);
    const [sections, setSections] = useState<EditorSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ type: "publish" | "rollback" | "deleteSection", payload?: string } | null>(null);

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

    function handleAddSubSection(parentId: string | null) {
        setActiveSectionId(null);
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
            await load();
            
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

        const siblings = sections
            .filter(s => (s.parentSectionId ?? null) === (current.parentSectionId ?? null))
            .sort((a, b) => a.sortOrder - b.sortOrder);

        const siblingIndex = siblings.findIndex(s => s.id === sectionId);
        if (siblingIndex < 0) return;

        const swapSiblingIndex = direction === 'up' ? siblingIndex - 1 : siblingIndex + 1;
        if (swapSiblingIndex < 0 || swapSiblingIndex >= siblings.length) return;

        const swapSibling = siblings[swapSiblingIndex];
        const currentNewSortOrder = swapSibling.sortOrder;
        const swapNewSortOrder = current.sortOrder;

        const apiPayload = [
            { sectionId: current.id, sortOrder: currentNewSortOrder },
            { sectionId: swapSibling.id, sortOrder: swapNewSortOrder }
        ];

        const newSections = sections.map(s => {
            if (s.id === current.id) return { ...s, sortOrder: currentNewSortOrder };
            if (s.id === swapSibling.id) return { ...s, sortOrder: swapNewSortOrder };
            return s;
        });

        setSections(buildTreeOrder(newSections));

        try {
            const res = await fetch(`${getBackendUrl()}/api/admin/social/topics/${topicId}/sections/reorder`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${session?.accessToken}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(apiPayload)
            });
            if (!res.ok) throw new Error("Failed to reorder");
            setToast({ message: "Section moved successfully", type: "success" });
        } catch (err: any) {
            setToast({ message: err.message || "Failed to reorder sections", type: "error" });
            await load();
        }
    }

    // Derived Data
    const activeSectionData = activeSectionId ? sections.find(s => s.id === activeSectionId) : null;
    const activeSectionReady = !!activeSectionData && !activeSectionId?.startsWith("new-");
    const backendUrl = getBackendUrl().replace(/\/$/, "");

    return {
        topic,
        sections,
        loading,
        activeSectionId,
        setActiveSectionId,
        isFormOpen,
        setIsFormOpen,
        isSaving,
        toast,
        setToast,
        confirmModal,
        setConfirmModal,
        activeSectionData,
        activeSectionReady,
        backendUrl,
        load,
        handlePublish,
        handleRollback,
        handleAddSubSection,
        handleSaveSection,
        handleDeleteSection,
        handleReorder,
        router
    };
}
