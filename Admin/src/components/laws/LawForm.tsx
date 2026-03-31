"use client";
import React, { useState, useCallback, useMemo,useEffect} from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import DatePicker from "@/components/form/date-picker";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Toast from "./Toast";
import PdfDropZone from "./PdfDropZone";

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


interface LawFormProps {
  onSaved?: () => void;
  onClose?: () => void;
  resetOnClose?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: "km", label: "Khmer" },
  { code: "en", label: "English" },
];

const DEFAULT_LANGUAGE = "km";
const DEFAULT_LANGS = ["km", "en"];

const CATEGORY_OPTIONS = [
  { value: "Royal Degree", labelKey: "categories.royalDegree" },
  { value: "Sub-Degree", labelKey: "categories.subDegree" },
  { value: "Prakas", labelKey: "categories.prakas" },
  { value: "Decision and Guideline", labelKey: "categories.decisionAndGuideline" },
];

function langLabel(code: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}

function makeEmptyTranslation(language: string): Translation {
  return { language, title: "", description: "", pdfFile: null };
}

const DESCRIPTION_MAX_LENGTH = 500;

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data: any = await res.json();
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.join(", ");
    if (typeof data === "object") {
      const direct = data.message || data.title || data.error || data.detail;
      if (direct) return String(direct);
      if (data.errors && typeof data.errors === "object") {
        const values = Object.values(data.errors).flat().filter(Boolean).map(String);
        if (values.length) return values.join(", ");
      }
    }
  } catch {
    return fallback;
  }
  return fallback;
}


export default function LawForm({ onSaved, onClose, resetOnClose = true }: LawFormProps) {
  const t = useTranslations("LawForm");
  const { data: session, status } = useSession();
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState<LangCode>(DEFAULT_LANGUAGE);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>(DEFAULT_LANGS.map(makeEmptyTranslation));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const usedCodes = useMemo(() => translations.map((tr) => tr.language), [translations]);
  const availableLangs = useMemo(() => SUPPORTED_LANGUAGES.filter((l) => !usedCodes.includes(l.code)), [usedCodes]);

  const getTranslation = useCallback((code: LangCode): Translation => {
    return translations.find((tr) => tr.language === code) ?? makeEmptyTranslation(code);
  }, [translations]);

  const selectedCategoryLabel = useMemo(() => {
    const opt = CATEGORY_OPTIONS.find((o) => o.value === category);
    return opt ? t(opt.labelKey) : "";
  }, [category, t]);

  const tabStatus = useCallback((code: LangCode): "complete" | "empty" => {
    return getTranslation(code).title.trim() ? "complete" : "empty";
  }, [getTranslation]);

  const completeCount = useMemo(() => translations.filter((tr) => tr.title.trim()).length, [translations]);

  const updateTranslation = useCallback((code: LangCode, patch: Partial<Translation>) => {
    setTranslations((prev) => prev.map((tr) => (tr.language === code ? { ...tr, ...patch } : tr)));
    if (Object.prototype.hasOwnProperty.call(patch, "title")) {
      setErrors((prev) => {
        const tErrs = { ...(prev.translations ?? {}) };
        if (tErrs[code]) {
          const { title: _omit, ...rest } = tErrs[code];
          if (Object.keys(rest).length) tErrs[code] = rest;
          else delete tErrs[code];
        }
        return { ...prev, translations: Object.keys(tErrs).length ? tErrs : undefined };
      });
    }
  }, []);

  const addLanguage = useCallback((code: LangCode) => {
    setTranslations((prev) => [...prev, makeEmptyTranslation(code)]);
    setActiveTab(code);
    setLangDropdownOpen(false);
  }, []);

  const removeLanguage = useCallback((code: LangCode) => {
    if (code === DEFAULT_LANGUAGE) return;
    setTranslations((prev) => prev.filter((t) => t.language !== code));
    setActiveTab(DEFAULT_LANGUAGE);
  }, []);

  function validate(): boolean {
    const newErrors: Errors = {};
    if (!category) newErrors.category = t("errors.categoryRequired");

    const tErrs: Record<LangCode, { title?: string }> = {};
    let firstInvalidTab: LangCode | null = null;
    translations.forEach((tr) => {
      if (!tr.title.trim()) {
        tErrs[tr.language] = { title: t("errors.titleRequired") };
        if (!firstInvalidTab) firstInvalidTab = tr.language;
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
    if (status === "loading" || !session?.accessToken) {
      setToast({ message: t("toast.error"), type: "error" });
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append("Category", category);
      if (date) form.append("Date", date);

      translations.forEach((tr, i) => {
        form.append(`Translations[${i}].Language`, tr.language);
        form.append(`Translations[${i}].Title`, tr.title);
        if (tr.description) form.append(`Translations[${i}].Description`, tr.description);
        if (tr.pdfFile) form.append(`Translations[${i}].PdfFile`, tr.pdfFile, `${tr.language}.pdf`);
      });

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

      const res = await fetch(`${BACKEND_URL}/api/laws`, {
        method: "POST",
        body: form,
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      if (!res.ok) {
        const message = await extractErrorMessage(res, t("toast.error"));
        throw new Error(message);
      }

      setToast({ message: t("toast.success"), type: "success" });
      resetForm();
      onSaved?.();
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : t("toast.error");
      setToast({ message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const activeTranslation = getTranslation(activeTab);
  const enMissing = useMemo(() => activeTab !== DEFAULT_LANGUAGE && !getTranslation(DEFAULT_LANGUAGE).title.trim(), [activeTab, getTranslation]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Ensure activeTab points to an existing translation
    if (usedCodes.includes(activeTab) || translations.length === 0) return;
    const fallback = translations.find((tr) => tr.language === DEFAULT_LANGUAGE) ?? translations[0];
    if (fallback) setActiveTab(fallback.language);
  }, [activeTab, translations, usedCodes]);

  function resetForm() {
    setCategory("");
    setDate("");
    setTranslations(DEFAULT_LANGS.map(makeEmptyTranslation));
    setActiveTab(DEFAULT_LANGUAGE);
    setCatDropdownOpen(false);
    setLangDropdownOpen(false);
    setErrors({});
    setToast(null);
    setSaving(false);
  }

  function isFormEmpty() {
    if (category || date) return false;
    if (translations.length !== DEFAULT_LANGS.length) return false;
    return translations.every((tr) => !tr.title.trim() && !tr.description.trim() && !tr.pdfFile);
  }

  function handleCloseClick() {
    if (isFormEmpty()) {
      if (resetOnClose) resetForm();
      onClose?.();
      return;
    }
    setShowConfirm(true);
  }

  function confirmClose() {
    setShowConfirm(false);
    if (resetOnClose) resetForm();
    onClose?.();
  }

  function cancelClose() {
    setShowConfirm(false);
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={cancelClose} />
            <div role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-lg p-5 w-full max-w-md mx-4">
              <h3 className="text-sm font-medium text-gray-900">{t("confirmCloseTitle")}</h3>
              <p className="text-xs text-gray-600 mt-2">{t("confirmCloseBody")}</p>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={cancelClose} className="px-3 py-1.5 rounded bg-white border border-primary text-primary text-sm">{t("cancel")}</button>
                <button type="button" onClick={confirmClose} className="px-3 py-1.5 rounded bg-primary text-sm text-white">{t("confirm")}</button>
              </div>
            </div>
          </div>
        )}
        {/* Row 1: Category + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-1">{t("categoryLabel")} <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              className={`dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.category ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`}
            >
              <span className={category ? "text-gray-900" : "text-gray-400"}>{selectedCategoryLabel || t("categoryPlaceholder")}</span>
              <svg className={`w-4 h-4 transition-transform text-gray-400 ${catDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Dropdown isOpen={catDropdownOpen} onClose={() => setCatDropdownOpen(false)} className="w-full left-0 origin-top">
              {CATEGORY_OPTIONS.map((cat) => (
                <DropdownItem
                  key={cat.value}
                  onClick={() => { setCategory(cat.value); setCatDropdownOpen(false); setErrors((p) => ({ ...p, category: undefined })); }}
                >
                  {t(cat.labelKey)}
                </DropdownItem>
              ))}
            </Dropdown>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
          <div>
            <DatePicker
              id="law-effective-date"
              label={t("publishDateLabel")}
              placeholder={t("publishDatePlaceholder")}
              defaultDate={date || undefined}
              onChange={(selectedDates: Date[], dateStr: string) => setDate(dateStr)}
            />
          </div>
        </div>

        {/* Language Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
            {translations.map((tr) => {
              const status = tabStatus(tr.language);
              const isActive = tr.language === activeTab;
              return (
                <div key={tr.language} className="flex items-center group relative min-w-max">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tr.language)}
                    className={`whitespace-nowrap flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    <span className={`w-2 h-2 rounded-full inline-block ${status === "complete" ? "bg-green-500" : "bg-gray-300 group-hover:bg-gray-400"} transition-colors duration-200`} />
                    <span>{langLabel(tr.language)}</span>
                    {tr.language === DEFAULT_LANGUAGE && (
                      <span className="text-[10px] leading-tight text-gray-400 font-normal ml-0.5 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide">{t("defaultBadge")}</span>
                    )}
                  </button>
                  {tr.language !== DEFAULT_LANGUAGE && (
                    <button
                      type="button"
                      onClick={() => removeLanguage(tr.language)}
                      className="ml-1.5 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      title={t("removeLanguage")}
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
                  {t("languageButton")}
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
              <p className="text-xs text-yellow-800">{t("missingDefaultWarning")}</p>
            </div>
          )}

          {/* Responsive 3-col grid: stacks on mobile, 2-col on sm, 3-col on lg */}
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">{t("titleLabel")} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={activeTranslation.title}
                placeholder={t("titlePlaceholder", { language: langLabel(activeTab) })}
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
                <label className="block text-sm font-medium text-gray-900">{t("descriptionLabel")} <span className="text-gray-400 font-normal">({t("optional")})</span></label>
                <span className={`text-[11px] ${activeTranslation.description.length > DESCRIPTION_MAX_LENGTH ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {activeTranslation.description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <textarea
                value={activeTranslation.description}
                placeholder={t("descriptionPlaceholder")}
                maxLength={DESCRIPTION_MAX_LENGTH}
                onChange={(e) => updateTranslation(activeTab, { description: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y ${activeTranslation.description.length >= DESCRIPTION_MAX_LENGTH ? 'border-amber-400' : 'border-gray-300 hover:border-gray-400'}`}
              />
            </div>

            {/* PDF upload */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">{t("pdfLabel")} <span className="text-gray-400 font-normal">({t("pdfOptional")})</span></label>
              <PdfDropZone file={activeTranslation.pdfFile} onChange={(f) => updateTranslation(activeTab, { pdfFile: f })} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-gray-400">{t("progress", { complete: completeCount, total: translations.length })}</span>
          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloseClick}
              className="inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-primary bg-white border border-primary hover:bg-gray-50 transition-all"
            >
              {t("close")}
            </button>
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
            {saving ? t("saving") : t("save")}
          </button>
          </div>
        </div>
      </form>
    </div>
  );
}

