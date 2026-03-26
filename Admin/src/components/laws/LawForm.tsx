"use client";
import React, { useState, useCallback } from "react";
import DatePicker from "@/components/form/date-picker";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

type LangCode = string;

type Translation = {
  language: LangCode;
  title: string;
  description: string;
  pdfFile: File | null;
};

type Errors = {
  category?: string;
  translations?: Record<LangCode, { title?: string }>;
};

const SUPPORTED_LANGUAGES = [
  { code: "km", label: "Khmer" },
  { code: "en", label: "English" },
];

const DEFAULT_LANGUAGE = "km";
const DEFAULT_LANGS = ["km", "en"];

function langLabel(code: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}

function makeEmptyTranslation(language: string): Translation {
  return { language, title: "", description: "", pdfFile: null };
}

function Toast({ message, type, onDismiss }: { message: string; type: "success" | "error"; onDismiss: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const base = "fixed bottom-6 right-6 z-50 p-3 rounded-md text-sm font-medium shadow";
  const cls = type === "success"
    ? `${base} bg-green-50 text-green-700 border border-green-100`
    : `${base} bg-red-50 text-red-700 border border-red-100`;

  return (
    <div role="status" aria-live="polite" className={cls}>
      {message}
    </div>
  );
}

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
const DESCRIPTION_MAX_LENGTH = 500;

function PdfDropZone({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const handleFile = (f: File | null) => {
    setSizeError(false);
    if (f && f.size > MAX_PDF_SIZE) {
      setSizeError(true);
      return;
    }
    onChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === "application/pdf") handleFile(f);
  };

  const zoneBase = "relative border-2 border-dashed rounded-xl p-3 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2";
  const zoneClass = file
    ? `${zoneBase} bg-green-50/50 border-green-300 hover:bg-green-50`
    : dragging
    ? `${zoneBase} bg-primary/5 border-primary`
    : `${zoneBase} bg-gray-50 border-gray-300 hover:border-primary/50 hover:bg-gray-50/80 group`;

  function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={zoneClass}
      aria-label="PDF upload dropzone"
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", zIndex: 10 }}
      />
      {file ? (
        <div className="flex items-center justify-between w-full p-2 bg-white rounded-lg shadow-sm border border-green-100 z-20 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">{file.name}</div>
              <div className="text-[11px] text-gray-500">{formatBytes(file.size)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(null); }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none z-30 relative"
            aria-label="Remove PDF"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
          </button>
        </div>
      ) : (
        <>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-primary">Upload PDF <span className="text-gray-400 font-normal">or drag</span></p>
            <p className="text-[10px] text-gray-400 mt-0.5">Max 10 MB</p>
          </div>
        </>
      )}
      {sizeError && (
        <p className="text-[11px] text-red-500 mt-1.5 z-20 relative">File exceeds 10 MB limit. Please choose a smaller file.</p>
      )}
    </div>
  );
}

export default function LawForm({ onSaved }: { onSaved?: () => void }) {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState<LangCode>(DEFAULT_LANGUAGE);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>(DEFAULT_LANGS.map(makeEmptyTranslation));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const usedCodes = translations.map((t) => t.language);
  const availableLangs = SUPPORTED_LANGUAGES.filter((l) => !usedCodes.includes(l.code));

  function getTranslation(code: LangCode): Translation {
    return translations.find((t) => t.language === code) ?? makeEmptyTranslation(code);
  }

  function tabStatus(code: LangCode): "complete" | "empty" {
    return getTranslation(code).title.trim() ? "complete" : "empty";
  }

  const completeCount = translations.filter((t) => t.title.trim()).length;

  const updateTranslation = useCallback((code: LangCode, patch: Partial<Translation>) => {
    setTranslations((prev) => prev.map((t) => (t.language === code ? { ...t, ...patch } : t)));
    if ("title" in patch) {
      setErrors((prev) => {
        const tErrs = { ...(prev.translations ?? {}) };
        if (tErrs[code]) delete tErrs[code].title;
        return { ...prev, translations: tErrs };
      });
    }
  }, []);

  const addLanguage = (code: LangCode) => {
    setTranslations((prev) => [...prev, makeEmptyTranslation(code)]);
    setActiveTab(code);
    setLangDropdownOpen(false);
  };

  const removeLanguage = (code: LangCode) => {
    if (code === DEFAULT_LANGUAGE) return;
    setTranslations((prev) => prev.filter((t) => t.language !== code));
    setActiveTab(DEFAULT_LANGUAGE);
  };

  function validate(): boolean {
    const newErrors: Errors = {};
    if (!category) newErrors.category = "Category is required";

    const tErrs: Record<LangCode, { title?: string }> = {};
    let firstInvalidTab: LangCode | null = null;
    translations.forEach((t) => {
      if (!t.title.trim()) {
        tErrs[t.language] = { title: "Title is required" };
        if (!firstInvalidTab) firstInvalidTab = t.language;
      }
    });
    if (Object.keys(tErrs).length) newErrors.translations = tErrs;

    setErrors(newErrors);
    if (firstInvalidTab) setActiveTab(firstInvalidTab);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const form = new FormData();
      form.append("Category", category);
      if (date) form.append("Date", date);

      translations.forEach((t, i) => {
        form.append(`Translations[${i}].Language`, t.language);
        form.append(`Translations[${i}].Title`, t.title);
        if (t.description) form.append(`Translations[${i}].Description`, t.description);
        if (t.pdfFile) form.append(`Translations[${i}].PdfFile`, t.pdfFile, `${t.language}.pdf`);
      });

      const res = await fetch("/api/laws", { method: "POST", body: form });
      if (!res.ok) throw new Error("Failed to save");

      setToast({ message: "Law saved successfully", type: "success" });
      setCategory("");
      setDate("");
      setTranslations(DEFAULT_LANGS.map(makeEmptyTranslation));
      setActiveTab(DEFAULT_LANGUAGE);
      setErrors({});
      onSaved?.();
    } catch {
      setToast({ message: "Save failed. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const activeTranslation = getTranslation(activeTab);
  const enMissing = activeTab !== DEFAULT_LANGUAGE && !getTranslation(DEFAULT_LANGUAGE).title.trim();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Row 1: Category + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-1">Category <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              className={`dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.category ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`}
            >
              <span className={category ? "text-gray-900" : "text-gray-400"}>{category || "Select category…"}</span>
              <svg className={`w-4 h-4 transition-transform text-gray-400 ${catDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Dropdown isOpen={catDropdownOpen} onClose={() => setCatDropdownOpen(false)} className="w-full left-0 origin-top">
              {["Civil Law", "Criminal Law", "Administrative Law", "Commercial Law", "Constitutional Law"].map((cat) => (
                <DropdownItem
                  key={cat}
                  onClick={() => { setCategory(cat); setCatDropdownOpen(false); setErrors((p) => ({ ...p, category: undefined })); }}
                >
                  {cat}
                </DropdownItem>
              ))}
            </Dropdown>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
          <div>
            <DatePicker
              id="law-effective-date"
              label="DD-MM-YYYY"
              placeholder="DD-MM-YYYY"
              defaultDate={date || undefined}
              onChange={(selectedDates: Date[], dateStr: string) => setDate(dateStr)}
            />
          </div>
        </div>

        {/* Language Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
            {translations.map((t) => {
              const status = tabStatus(t.language);
              const isActive = t.language === activeTab;
              return (
                <div key={t.language} className="flex items-center group relative min-w-max">
                  <button
                    type="button"
                    onClick={() => setActiveTab(t.language)}
                    className={`whitespace-nowrap flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    <span className={`w-2 h-2 rounded-full inline-block ${status === "complete" ? "bg-green-500" : "bg-gray-300 group-hover:bg-gray-400"} transition-colors duration-200`} />
                    <span>{langLabel(t.language)}</span>
                    {t.language === DEFAULT_LANGUAGE && (
                      <span className="text-[10px] leading-tight text-gray-400 font-normal ml-0.5 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide">Default</span>
                    )}
                  </button>
                  {t.language !== DEFAULT_LANGUAGE && (
                    <button
                      type="button"
                      onClick={() => removeLanguage(t.language)}
                      className="ml-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      title="Remove language"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
            {availableLangs.length > 0 && (
              <div className="flex items-center pl-4 relative">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="dropdown-toggle inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-md hover:bg-primary/10 mb-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Language
                </button>
                <Dropdown isOpen={langDropdownOpen} onClose={() => setLangDropdownOpen(false)} className="left-4 top-full mt-0">
                  {availableLangs.map((l) => (
                    <DropdownItem key={l.code} onClick={() => addLanguage(l.code as LangCode)}>
                      {l.label}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
            )}
          </nav>
        </div>

        {/* Translation fields — Title | Description | PDF in one row */}
        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
          {enMissing && (
            <div className="rounded-md bg-yellow-50 p-2.5 border border-yellow-200 flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-yellow-800">Khmer (default) title is missing — fallback may not work correctly.</p>
            </div>
          )}

          {/* Responsive 3-col grid: stacks on mobile, 2-col on sm, 3-col on lg */}
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={activeTranslation.title}
                placeholder={`Title in ${langLabel(activeTab)}`}
                onChange={(e) => updateTranslation(activeTab, { title: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.translations?.[activeTab]?.title ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`}
              />
              {errors.translations?.[activeTab]?.title && (
                <p className="text-xs text-red-500 mt-1">{errors.translations[activeTab].title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-900">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <span className={`text-[11px] ${activeTranslation.description.length > DESCRIPTION_MAX_LENGTH ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {activeTranslation.description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <textarea
                value={activeTranslation.description}
                placeholder="Brief summary…"
                maxLength={DESCRIPTION_MAX_LENGTH}
                onChange={(e) => updateTranslation(activeTab, { description: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y ${activeTranslation.description.length >= DESCRIPTION_MAX_LENGTH ? 'border-amber-400' : 'border-gray-300 hover:border-gray-400'}`}
              />
            </div>

            {/* PDF upload */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">PDF <span className="text-gray-400 font-normal">(optional)</span></label>
              <PdfDropZone file={activeTranslation.pdfFile} onChange={(f) => updateTranslation(activeTab, { pdfFile: f })} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-gray-400">{completeCount}/{translations.length} language{translations.length !== 1 ? "s" : ""} completed</span>
          <button
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all ${saving ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90 hover:shadow-md"}`}
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            {saving ? "Saving…" : "Save Law Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
 