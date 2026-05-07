"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import SectionTree from "@/components/social/SectionTree";
import SectionForm from "@/components/social/SectionForm";
import Toast from "@/components/laws/Toast";
import { Modal } from "@/components/ui/modal";
import SectionMediaPanel from "@/components/social/SectionMediaPanel";

import { useTopicEditor } from "../../../../hooks/useTopicEditor";
import { SocialReference } from "@/types/social.types";

export default function TopicEditorPage() {
    const locale = useLocale();
    const t = useTranslations("SocialEditor");

    const {
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
        handleAddSubSection,
        handleSaveSection,
        handleDeleteSection,
        handleReorder,
        router,
        session
    } = useTopicEditor();

    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [savingSettings, setSavingSettings] = React.useState(false);
    const [uploadingPdf, setUploadingPdf] = React.useState(false);
    const [references, setReferences] = React.useState<SocialReference[]>([]);
    const [loadingReferences, setLoadingReferences] = React.useState(false);
    const [draggingReferenceId, setDraggingReferenceId] = React.useState<string | null>(null);
    const [draggingReferenceLang, setDraggingReferenceLang] = React.useState<"km" | "en" | null>(null);


    const loadReferences = React.useCallback(async () => {
        if (!topic?.id || !session?.accessToken) return;
        setLoadingReferences(true);
        try {
            const res = await fetch(`${backendUrl}/api/admin/social/topics/${topic.id}/references`, {
                headers: { "Authorization": `Bearer ${session.accessToken}` }
            });
            if (!res.ok) throw new Error("Failed to load references");
            const data = await res.json();
            setReferences(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setToast({ message: err.message || "Failed to load references", type: "error" });
        } finally {
            setLoadingReferences(false);
        }
    }, [topic?.id, backendUrl, session?.accessToken, setToast]);

    React.useEffect(() => {
        loadReferences();
    }, [loadReferences]);

    if (loading) return <div className="p-6">Loading Topic...</div>;
    if (!topic) return <div className="p-6">Topic not found</div>;

    const isPublished = topic.status === 1 || topic.status === "Published";

    const currentFormInitialData = activeSectionId?.startsWith('new-') 
        ? null 
        : activeSectionData;

    async function handleSaveSettings() {
        setSavingSettings(true);
        try {
            const res = await fetch(`${backendUrl}/api/admin/social/topics/${topic.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({
                    titleKm: topic.titleKm,
                    titleEn: topic.titleEn,
                    subtitleKm: topic.subtitleKm,
                    subtitleEn: topic.subtitleEn,
                    sortOrder: topic.sortOrder,
                    status: topic.status,
                }),
            });
            if (!res.ok) throw new Error("Failed to save");
            setToast({ message: "Topic settings saved", type: "success" });
            setSettingsOpen(false);
            load();
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
        } finally {
            setSavingSettings(false);
        }
    }

    async function handleUploadPdf(file: File, lang: "km" | "en") {
        if (!file || file.type !== "application/pdf") {
            setToast({ message: "Only PDF files are allowed", type: "error" });
            return;
        }

        setUploadingPdf(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("language", lang);
            if (lang === "km") {
                formData.append("titleKm", file.name);
            } else {
                formData.append("titleEn", file.name);
            }

            const res = await fetch(`${backendUrl}/api/admin/social/topics/${topic.id}/references/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Failed to upload PDF");

            const data = await res.json();
            setReferences((prev) => [...prev, data]);
            setToast({ message: "PDF uploaded successfully.", type: "success" });
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
        } finally {
            setUploadingPdf(false);
        }
    }

    const formatBytes = (bytes: number) => {
        if (!bytes && bytes !== 0) return "";
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    const referencesKm = references.filter((ref) => ref.language === "km").sort((a, b) => a.sortOrder - b.sortOrder);
    const referencesEn = references.filter((ref) => ref.language === "en").sort((a, b) => a.sortOrder - b.sortOrder);

    async function handleDeleteReference(referenceId: string) {
        try {
            const res = await fetch(`${backendUrl}/api/admin/social/references/${referenceId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`
                }
            });
            if (!res.ok) throw new Error("Failed to delete reference");
            setReferences((prev) => prev.filter((item) => item.id !== referenceId));
            setToast({ message: "Reference deleted", type: "success" });
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
        }
    }

    async function persistReferenceOrder(next: SocialReference[]) {
        const payload = next.map((item, idx) => ({ referenceId: item.id, sortOrder: idx }));
        try {
            const res = await fetch(`${backendUrl}/api/admin/social/topics/${topic.id}/references/reorder`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to reorder references");
        } catch (err: any) {
            setToast({ message: err.message, type: "error" });
            loadReferences();
        }
    }

    const handleDropReference = async (targetId: string, lang: "km" | "en") => {
        if (!draggingReferenceId || draggingReferenceId === targetId) return;
        if (draggingReferenceLang !== lang) return;
        const list = references.filter((r) => r.language === lang).sort((a, b) => a.sortOrder - b.sortOrder);
        const currentIndex = list.findIndex((r) => r.id === draggingReferenceId);
        const targetIndex = list.findIndex((r) => r.id === targetId);
        if (currentIndex < 0 || targetIndex < 0) return;

        const next = [...list];
        const [moved] = next.splice(currentIndex, 1);
        next.splice(targetIndex, 0, moved);
        const withOrder = next.map((item, idx) => ({ ...item, sortOrder: idx }));

        setReferences((prev) => prev.map((item) => {
            if (item.language !== lang) return item;
            const updated = withOrder.find((entry) => entry.id === item.id);
            return updated ? updated : item;
        }));
        setDraggingReferenceId(null);
        setDraggingReferenceLang(null);
        await persistReferenceOrder(withOrder);
    };

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
                   <div
                       className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full border ${
                           isPublished
                               ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                               : "bg-amber-50 text-amber-700 border-amber-200"
                       }`}
                   >
                       <span
                           className={`h-2 w-2 rounded-full ${
                               isPublished ? "bg-emerald-500" : "bg-amber-500"
                           }`}
                       />
                       {isPublished ? "Live" : "Draft"}
                   </div>
                   <button onClick={() => setSettingsOpen(true)} className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200">
                       Reference
                   </button>
                   <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200">
                       Back
                   </button>
                   <button
                       onClick={() => setConfirmModal({ type: 'publish' })}
                       className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-md ${
                           isPublished ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                       }`}
                   >
                       {isPublished ? (t("unpublish") || "Unpublish") : (t("publish") || "Publish Live")}
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

                            <SectionMediaPanel
                                activeSectionData={activeSectionData || null}
                                activeSectionReady={activeSectionReady}
                                backendUrl={backendUrl}
                                onChanged={load}
                                setToast={setToast}
                            />
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
                       {confirmModal?.type === 'publish' && (isPublished ? "Unpublish Topic" : "Publish Topic")}
                       {confirmModal?.type === 'deleteSection' && "Delete Section"}
                   </h3>
                   <p className="text-sm text-gray-600 mb-6">
                       {confirmModal?.type === 'publish' && (isPublished
                           ? "Are you sure you want to unpublish? This topic will be removed from the public landing page."
                           : "Are you sure you want to publish? This will push all content live immediately.")}
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
                               confirmModal?.type === 'publish' ? (isPublished ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700') :
                               'bg-red-600 hover:bg-red-700'
                           }`}
                           onClick={() => {
                               if (confirmModal?.type === 'publish') handlePublish();
                               if (confirmModal?.type === 'deleteSection' && confirmModal.payload) handleDeleteSection(confirmModal.payload);
                           }}
                       >
                           {confirmModal?.type === 'publish' ? (isPublished ? 'Unpublish' : 'Publish') : 'Confirm'}
                       </button>
                   </div>
                </div>
            </Modal>

            {/* Topic Settings Modal */}
            <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} className="max-w-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Reference</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Reference PDFs (Khmer)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition min-h-[120px]">
                            <div className="w-full mb-2">
                                {loadingReferences && (
                                    <div className="text-sm text-gray-500">Loading references...</div>
                                )}
                                {!loadingReferences && referencesKm.length === 0 && (
                                    <div className="text-sm text-gray-500">No Khmer reference PDFs uploaded yet.</div>
                                )}
                                {referencesKm.map((ref) => (
                                    <div
                                        key={ref.id}
                                        draggable
                                        onDragStart={() => {
                                            setDraggingReferenceId(ref.id);
                                            setDraggingReferenceLang("km");
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDropReference(ref.id, "km")}
                                        className="flex items-center justify-between w-full bg-white p-3 rounded-lg border border-gray-200 shadow-sm mb-2 cursor-move"
                                        title="Drag to reorder"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <svg className="w-8 h-8 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-medium text-gray-700 truncate">{ref.titleKm || ref.fileName}</span>
                                                <span className="text-xs text-gray-500">{formatBytes(ref.fileSizeBytes)}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteReference(ref.id)} className="text-gray-400 hover:text-red-500 p-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <label className="flex flex-col items-center cursor-pointer w-full py-4">
                                <svg className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                <span className="text-sm font-medium text-gray-700">
                                    {uploadingPdf ? 'Uploading...' : 'Click to add Khmer PDF'}
                                </span>
                                <input type="file" accept="application/pdf" className="hidden" disabled={uploadingPdf} onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) handleUploadPdf(e.target.files[0], "km");
                                }} />
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Reference PDFs (English)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition min-h-[120px]">
                            <div className="w-full mb-2">
                                {loadingReferences && (
                                    <div className="text-sm text-gray-500">Loading references...</div>
                                )}
                                {!loadingReferences && referencesEn.length === 0 && (
                                    <div className="text-sm text-gray-500">No English reference PDFs uploaded yet.</div>
                                )}
                                {referencesEn.map((ref) => (
                                    <div
                                        key={ref.id}
                                        draggable
                                        onDragStart={() => {
                                            setDraggingReferenceId(ref.id);
                                            setDraggingReferenceLang("en");
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDropReference(ref.id, "en")}
                                        className="flex items-center justify-between w-full bg-white p-3 rounded-lg border border-gray-200 shadow-sm mb-2 cursor-move"
                                        title="Drag to reorder"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <svg className="w-8 h-8 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-medium text-gray-700 truncate">{ref.titleEn || ref.fileName}</span>
                                                <span className="text-xs text-gray-500">{formatBytes(ref.fileSizeBytes)}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteReference(ref.id)} className="text-gray-400 hover:text-red-500 p-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <label className="flex flex-col items-center cursor-pointer w-full py-4">
                                <svg className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                <span className="text-sm font-medium text-gray-700">
                                    {uploadingPdf ? 'Uploading...' : 'Click to add English PDF'}
                                </span>
                                <input type="file" accept="application/pdf" className="hidden" disabled={uploadingPdf} onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) handleUploadPdf(e.target.files[0], "en");
                                }} />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setSettingsOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings || uploadingPdf}
                        className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {savingSettings ? "Saving..." : "Save Reference"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
