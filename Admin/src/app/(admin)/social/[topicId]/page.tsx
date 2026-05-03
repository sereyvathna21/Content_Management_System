"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import SectionTree from "@/components/social/SectionTree";
import SectionForm from "@/components/social/SectionForm";
import Toast from "@/components/laws/Toast";
import { Modal } from "@/components/ui/modal";
import SectionMediaPanel from "@/components/social/SectionMediaPanel";

import { useTopicEditor } from "../../../../hooks/useTopicEditor";

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
        handleRollback,
        handleAddSubSection,
        handleSaveSection,
        handleDeleteSection,
        handleReorder,
        router
    } = useTopicEditor();

    if (loading) return <div className="p-6">Loading Topic...</div>;
    if (!topic) return <div className="p-6">Topic not found</div>;

    const currentFormInitialData = activeSectionId?.startsWith('new-') 
        ? null 
        : activeSectionData;

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
