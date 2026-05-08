"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

type LangCode = "km" | "en";

import { SectionData } from "../../types/social.types";

type Props = {
  initialData?: SectionData | null;
  onSave: (data: SectionData) => void;
  onCancel: () => void;
  saving?: boolean;
  formId?: string;
  showHeader?: boolean;
  showActions?: boolean;
  className?: string;
};

export default function SectionForm({
  initialData,
  onSave,
  onCancel,
  saving,
  formId,
  showHeader = true,
  showActions = true,
  className,
}: Props) {
  const t = useTranslations("SocialEditor");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<LangCode>(locale === "en" ? "en" : "km");
  
  const [data, setData] = useState<SectionData>({
    sectionKey: "",
    titleKm: "",
    titleEn: "",
    contentKm: "",
    contentEn: "",
  });

  const [errors, setErrors] = useState<{sectionKey?: string; titleKm?: string; contentKm?: string}>({});

  useEffect(() => {
    if (initialData) {
      setData({ ...initialData });
    } else {
      setData({
        sectionKey: "",
        titleKm: "",
        titleEn: "",
        contentKm: "",
        contentEn: "",
      });
    }
    setErrors({});
  }, [initialData]);

  // Sync activeTab to global locale
  useEffect(() => {
    if (locale === "en") {
      setActiveTab("en");
    } else {
      setActiveTab("km");
    }
  }, [locale]);

  function validate() {
      const newErrors: any = {};
      if (!data.sectionKey.trim()) newErrors.sectionKey = t("sectionForm.errors.sectionKeyRequired") || "Section key is required";
      if (!data.titleKm.trim()) newErrors.titleKm = t("sectionForm.errors.titleKmRequired") || "Khmer title is required";
      if (!data.contentKm.trim()) newErrors.contentKm = t("sectionForm.errors.contentKmRequired") || "Khmer content is required";
      
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) setActiveTab("km"); // Switch to Khmer tab to show errors
      return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (validate()) {
          onSave(data);
      }
  }

  const isKm = activeTab === "km";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className ?? ""}`}
    >
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {initialData?.id ? (t("sectionForm.titleEdit") || "Edit Section") : (t("sectionForm.titleNew") || "New Section")}
          </h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}

      <div className="mb-5">
          <label className="block text-[15px] font-medium text-gray-900 mb-2">
            {t("sectionKey") || "Section Key"} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.sectionKey}
            onChange={(e) => setData({ ...data, sectionKey: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
            placeholder={t("sectionForm.sectionKeyPlaceholder") || "e.g. intro-block"}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none ${errors.sectionKey ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.sectionKey && <p className="text-xs text-red-500 mt-1">{errors.sectionKey}</p>}
      </div>

       {/* Language Tabs */}
       <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab("km")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                isKm ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("sectionForm.tabKhmer") || "Khmer"} <span className="text-[10px] text-gray-400 border ml-1 px-1 rounded">{t("sectionForm.tabDefault") || "Default"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                !isKm ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("sectionForm.tabEnglish") || "English"}
            </button>
          </nav>
       </div>

       {/* Title Field Based on Tab */}
       <div className="mb-5">
         <label className="block text-[15px] font-medium text-gray-900 mb-2">
             {t("sectionTitle") || "Title"} {isKm && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={(isKm ? data.titleKm : data.titleEn) || ""}
            onChange={(e) => isKm ? setData({ ...data, titleKm: e.target.value }) : setData({ ...data, titleEn: e.target.value })}
            placeholder={isKm ? (t("sectionForm.titlePlaceholderKm") || "Khmer title...") : (t("sectionForm.titlePlaceholderEn") || "Title...")}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none ${isKm && errors.titleKm ? "border-red-500" : "border-gray-300"}`}
          />
          {isKm && errors.titleKm && <p className="text-xs text-red-500 mt-1">{errors.titleKm}</p>}
       </div>

       {/* Content Field Based on Tab */}
       <div className="mb-5">
         <label className="block text-[15px] font-medium text-gray-900 mb-2">
             {t("sectionContent") || "Content (Markdown)"} {isKm && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={10}
            value={(isKm ? data.contentKm : data.contentEn) || ""}
            onChange={(e) => isKm ? setData({ ...data, contentKm: e.target.value }) : setData({ ...data, contentEn: e.target.value })}
            placeholder={isKm ? (t("sectionForm.contentPlaceholderKm") || "Write Khmer content here...") : (t("sectionForm.contentPlaceholderEn") || "Write markdown content here...")}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-y font-mono ${isKm && errors.contentKm ? "border-red-500" : "border-gray-300"}`}
          />
          {isKm && errors.contentKm && <p className="text-xs text-red-500 mt-1">{errors.contentKm}</p>}
       </div>

       {showActions && (
         <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
           <button
             type="button"
             onClick={onCancel}
             className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
           >
             {t("sectionForm.cancel") || "Cancel"}
           </button>
           <button
             type="submit"
             disabled={saving}
             className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
           >
             {saving ? (t("sectionForm.saving") || "Saving...") : (t("sectionForm.save") || "Save Block")}
           </button>
         </div>
       )}
    </form>
  );
}
