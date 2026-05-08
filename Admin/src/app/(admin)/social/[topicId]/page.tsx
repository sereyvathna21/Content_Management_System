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
    const [showMediaPanel, setShowMediaPanel] = React.useState(false);


    const loadReferences = React.useCallback(async () => {
        if (!topic?.id || !session?.accessToken) return;
        setLoadingReferences(true);
        try {
            const res = await fetch(`${backendUrl}/api/admin/social/topics/${topic.id}/references`, {
                headers: { "Authorization": `Bearer ${session.accessToken}` }
            });
            if (!res.ok) throw new Error(t("references.loadFailed") || "Failed to load references");
            const data = await res.json();
            setReferences(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setToast({ message: err.message || (t("references.loadFailed") || "Failed to load references"), type: "error" });
        } finally {
            setLoadingReferences(false);
        }
    }, [topic?.id, backendUrl, session?.accessToken, setToast, t]);

    React.useEffect(() => {
        loadReferences();
    }, [loadReferences]);

    if (loading) return <div className="p-6">{t("loadingTopic") || "Loading topic..."}</div>;
    if (!topic) return <div className="p-6">{t("topicNotFound") || "Topic not found"}</div>;

    const isPublished = topic.status === 1 || topic.status === "Published";
    const sectionFormId = "section-editor-form";

    const currentFormInitialData = activeSectionId?.startsWith('new-') 
        ? null 
        : activeSectionData;

    function handleCloseSectionModal() {
        setIsFormOpen(false);
        setActiveSectionId(null);
        setShowMediaPanel(false);
    }

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
            if (!res.ok) throw new Error(t("settings.saveFailed") || "Failed to save");
            setToast({ message: t("settings.saveSuccess") || "Topic settings saved", type: "success" });
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
            setToast({ message: t("errors.onlyPdf") || "Only PDF files are allowed", type: "error" });
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

            if (!res.ok) throw new Error(t("errors.uploadFailed") || "Failed to upload PDF");

            const data = await res.json();
            setReferences((prev) => [...prev, data]);
            setToast({ message: t("success.uploadSuccess") || "PDF uploaded successfully.", type: "success" });
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
            if (!res.ok) throw new Error(t("errors.deleteReferenceFailed") || "Failed to delete reference");
            setReferences((prev) => prev.filter((item) => item.id !== referenceId));
            setToast({ message: t("success.deleteReferenceSuccess") || "Reference deleted", type: "success" });
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
            if (!res.ok) throw new Error(t("errors.reorderFailed") || "Failed to reorder references");
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
        <div className="flex flex-col min-h-[calc(100vh-80px)] p-4 sm:p-6 space-y-6 overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 shrink-0 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <div>
                   <h1 className="text-2xl font-bold text-gray-900">
                       {locale === "en" && topic.titleEn ? topic.titleEn : topic.titleKm}
                   </h1>
                   <p className="text-sm text-gray-500 font-mono">/{topic.slug}</p>
               </div>
               <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:mt-1">
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
                       {isPublished ? (t("status.live") || "Live") : (t("status.draft") || "Draft")}
                   </div>
                   <button onClick={() => setSettingsOpen(true)} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200">
                       {t("references.title") || "Reference"}
                   </button>
                   <button onClick={() => router.back()} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200">
                       {t("back") || "Back"}
                   </button>
                   <button
                       onClick={() => setConfirmModal({ type: 'publish' })}
                       className={`w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-md ${
                           isPublished ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                       }`}
                   >
                       {isPublished ? (t("unpublish") || "Unpublish") : (t("publishLive") || "Publish Live")}
                   </button>
               </div>
            </div>

            {/* Split Editor UI */}
            <div className="flex flex-col gap-6 flex-1 min-h-0">
                {/* Content Sections */}
                <div className="w-full flex flex-col h-full">
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
            </div>

            <Modal isOpen={isFormOpen} onClose={handleCloseSectionModal} className="max-w-5xl p-0">
                <div className="flex flex-col max-h-[85vh]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900">
                            {currentFormInitialData?.id ? (t("sectionForm.titleEdit") || "Edit Section") : (t("sectionForm.titleNew") || "New Section")}
                        </h3>
                        <button
                            type="button"
                            onClick={handleCloseSectionModal}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <SectionForm 
                            formId={sectionFormId}
                            initialData={currentFormInitialData as any}
                            onSave={handleSaveSection}
                            onCancel={handleCloseSectionModal}
                            saving={isSaving}
                            showHeader={false}
                            showActions={false}
                        />

                        {!showMediaPanel && (
                            <button
                                type="button"
                                onClick={() => setShowMediaPanel(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/30 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                {t("addImage") || "Add Image"}
                            </button>
                        )}

                        {showMediaPanel && (
                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-semibold text-gray-900">{t("sectionImage") || "Section Images"}</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaPanel(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <SectionMediaPanel
                                    activeSectionData={activeSectionData || null}
                                    activeSectionReady={activeSectionReady}
                                    backendUrl={backendUrl}
                                    onChanged={load}
                                    setToast={setToast}
                                    filterLang={locale === "en" ? "en" : "km"}
                                />
                            </div>
                        )}
                    </div>
                    <div className="border-t border-gray-100 bg-white px-6 py-4">
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseSectionModal}
                                className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {t("sectionForm.cancel") || "Cancel"}
                            </button>
                            <button
                                type="submit"
                                form={sectionFormId}
                                disabled={isSaving}
                                className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isSaving ? (t("sectionForm.saving") || "Saving...") : (t("sectionForm.save") || "Save Block")}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modals */}
            <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} className="max-w-md p-6">
                <div>
                   <h3 className="text-lg font-semibold mb-2 text-gray-800">
                       {confirmModal?.type === 'publish' && (isPublished ? (t("confirmModal.unpublishTitle") || "Unpublish Topic") : (t("confirmModal.publishTitle") || "Publish Topic"))}
                       {confirmModal?.type === 'deleteSection' && (t("confirmModal.deleteTitle") || "Delete Section")}
                   </h3>
                   <p className="text-sm text-gray-600 mb-6">
                       {confirmModal?.type === 'publish' && (isPublished
                           ? (t("confirmModal.unpublishBody") || "Are you sure you want to unpublish? This topic will be removed from the public landing page.")
                           : (t("confirmModal.publishBody") || "Are you sure you want to publish? This will push all content live immediately."))}
                       {confirmModal?.type === 'deleteSection' && (t("confirmModal.deleteBody") || "Are you sure you want to delete this block? All child blocks will also be deleted. This cannot be undone.")}
                   </p>
                   <div className="flex justify-end gap-3">
                       <button
                           className="h-9 px-4 rounded-lg font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                           onClick={() => setConfirmModal(null)}
                       >
                           {t("confirmModal.cancel") || "Cancel"}
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
                           {confirmModal?.type === 'publish' ? (isPublished ? (t("confirmModal.unpublish") || "Unpublish") : (t("confirmModal.publish") || "Publish")) : (t("confirmModal.confirm") || "Confirm")}
                       </button>
                   </div>
                </div>
            </Modal>

            {/* Topic Settings Modal */}
            <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} className="max-w-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t("references.title") || "Reference"}</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">{t("references.khmerLabel") || "Reference PDFs (Khmer)"}</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition min-h-[120px]">
                            <div className="w-full mb-2">
                                {loadingReferences && (
                                    <div className="text-sm text-gray-500">{t("references.loading") || "Loading references..."}</div>
                                )}
                                {!loadingReferences && referencesKm.length === 0 && (
                                    <div className="text-sm text-gray-500">{t("references.emptyKhmer") || "No Khmer reference PDFs uploaded yet."}</div>
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
                                        title={t("references.dragToReorder") || "Drag to reorder"}
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
                                    {uploadingPdf ? (t("references.uploading") || "Uploading...") : (t("references.addKhmer") || "Click to add Khmer PDF")}
                                </span>
                                <input type="file" accept="application/pdf" className="hidden" disabled={uploadingPdf} onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) handleUploadPdf(e.target.files[0], "km");
                                }} />
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">{t("references.englishLabel") || "Reference PDFs (English)"}</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition min-h-[120px]">
                            <div className="w-full mb-2">
                                {loadingReferences && (
                                    <div className="text-sm text-gray-500">{t("references.loading") || "Loading references..."}</div>
                                )}
                                {!loadingReferences && referencesEn.length === 0 && (
                                    <div className="text-sm text-gray-500">{t("references.emptyEnglish") || "No English reference PDFs uploaded yet."}</div>
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
                                        title={t("references.dragToReorder") || "Drag to reorder"}
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
                                    {uploadingPdf ? (t("references.uploading") || "Uploading...") : (t("references.addEnglish") || "Click to add English PDF")}
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
                        {t("references.cancel") || "Cancel"}
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings || uploadingPdf}
                        className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {savingSettings ? (t("references.saving") || "Saving...") : (t("references.save") || "Save Reference")}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
