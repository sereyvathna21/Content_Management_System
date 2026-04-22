"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import DatePicker from "@/components/form/date-picker";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import AttachmentDropZone from "./AttachmentDropZone";
import Toast from "./Toast";

type LangCode = string;

type Translation = {
  language: LangCode;
  title: string;
  content: string;
  attachmentFile: File | null;
  existingAttachmentUrl?: string;
  categoryValue?: string;
  categoryLabel?: string;
};

type Errors = {
  translations?: Record<LangCode, { title?: string; category?: string }>;
};

type InitialPublication = {
  id: string;
  category?: string;
  publicationDate?: string;
  translations: Array<{
    language: string;
    title: string;
    content?: string;
    attachmentUrl?: string;
    category?: string;
  }>;
};

interface PublicationFormProps {
  onSaved?: () => void;
  onClose?: () => void;
  resetOnClose?: boolean;
  initialPublication?: InitialPublication | null;
}

const SUPPORTED_LANGUAGES = [
  { code: "km", label: "Khmer" },
  { code: "en", label: "English" },
];

const DEFAULT_LANGUAGE = "km";
const DEFAULT_LANGS = ["km", "en"];
const CONTENT_MAX_LENGTH = 5000;

const CATEGORY_OPTIONS = [
  { value: "NSPC", labelKey: "categories.nspc" },
  { value: "Others", labelKey: "categories.others" },
];

function langLabel(code: string) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.label ?? code.toUpperCase();
}

function makeEmptyTranslation(language: string): Translation {
  return {
    language,
    title: "",
    content: "",
    attachmentFile: null,
    categoryValue: "",
    categoryLabel: "",
  };
}

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

function resolveAttachmentUrl(attachmentUrl?: string) {
  if (!attachmentUrl) return null;
  if (/^https?:\/\//i.test(attachmentUrl)) return attachmentUrl;
  const backendUrl = getBackendUrl();
  return `${backendUrl}${attachmentUrl.startsWith("/") ? "" : "/"}${attachmentUrl}`;
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await res.json();

    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.filter(Boolean).map(String).join(", ");

    if (typeof data === "object") {
      const obj = data as {
        message?: string;
        title?: string;
        error?: string;
        detail?: string;
        errors?: Record<string, unknown>;
      };

      const direct = obj.message || obj.title || obj.error || obj.detail;
      if (direct) return String(direct);

      if (obj.errors && typeof obj.errors === "object") {
        const values = Object.values(obj.errors)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter(Boolean)
          .map(String);

        if (values.length) return values.join(", ");
      }
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export default function PublicationForm({
  onSaved,
  onClose,
  resetOnClose = true,
  initialPublication,
}: PublicationFormProps) {
  const t = useTranslations("PublicationForm");
  const { data: session, status } = useSession();
  const isEditing = Boolean(initialPublication?.id);

  const buildInitialTranslations = useCallback((publication?: InitialPublication | null) => {
    // Ensure the form only contains the default languages (Khmer + English).
    // For each default language, prefer the provided translation if available; otherwise create an empty translation.
    const map = new Map<string, { language: string; title?: string; content?: string; attachmentUrl?: string; category?: string }>();
    if (publication?.translations?.length) {
      publication.translations.forEach((tr) => {
        if (tr?.language) map.set(tr.language.toLowerCase(), tr as any);
      });
    }

    return DEFAULT_LANGS.map((lang) => {
      const existing = map.get(lang.toLowerCase());
      return {
        language: lang,
        title: existing?.title ?? "",
        content: existing?.content ?? "",
        attachmentFile: null,
        existingAttachmentUrl: existing?.attachmentUrl,
        // prefer a per-translation category if provided, otherwise fall back to publication-level category
        categoryValue: existing?.category ?? publication?.category ?? "",
        categoryLabel: existing?.category ?? publication?.category ?? "",
      } as Translation;
    });
  }, []);

  // category is now per-translation; top-level category will be derived from default translation on submit
  const [publicationDate, setPublicationDate] = useState(initialPublication?.publicationDate?.split("T")[0] ?? "");
  const [activeTab, setActiveTab] = useState<LangCode>(DEFAULT_LANGUAGE);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>(buildInitialTranslations(initialPublication));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setPublicationDate(initialPublication?.publicationDate?.split("T")[0] ?? "");
    setTranslations(buildInitialTranslations(initialPublication));
    setActiveTab(initialPublication?.translations?.find((tr) => tr.language === DEFAULT_LANGUAGE)?.language ?? DEFAULT_LANGUAGE);
    setErrors({});
    setToast(null);
    setSaving(false);
  }, [initialPublication, buildInitialTranslations]);

  const usedCodes = useMemo(() => translations.map((translation) => translation.language), [translations]);
  const availableLangs = useMemo(
    () => SUPPORTED_LANGUAGES.filter((language) => !usedCodes.includes(language.code)),
    [usedCodes],
  );

  const getTranslation = useCallback(
    (code: LangCode): Translation => translations.find((translation) => translation.language === code) ?? makeEmptyTranslation(code),
    [translations],
  );

  const completeCount = useMemo(
    () => translations.filter((translation) => translation.title.trim()).length,
    [translations],
  );

  const tabStatus = useCallback(
    (code: LangCode): "complete" | "empty" => (getTranslation(code).title.trim() ? "complete" : "empty"),
    [getTranslation],
  );

  const updateTranslation = useCallback((code: LangCode, patch: Partial<Translation>) => {
    setTranslations((prev) => prev.map((translation) => (translation.language === code ? { ...translation, ...patch } : translation)));

    if (
      Object.prototype.hasOwnProperty.call(patch, "title") ||
      Object.prototype.hasOwnProperty.call(patch, "categoryValue") ||
      Object.prototype.hasOwnProperty.call(patch, "categoryLabel")
    ) {
      setErrors((prev) => {
        const translationErrors = { ...(prev.translations ?? {}) } as Record<LangCode, { title?: string; category?: string }>;
        if (translationErrors[code]) {
          const { title: _ignoredTitle, category: _ignoredCategory, ...rest } = translationErrors[code];
          if (Object.keys(rest).length) translationErrors[code] = rest as any;
          else delete translationErrors[code];
        }

        return {
          ...prev,
          translations: Object.keys(translationErrors).length ? translationErrors : undefined,
        };
      });
    }
  }, []);

  const addLanguage = useCallback((code: LangCode) => {
    // Adding extra languages is not allowed; form is restricted to Khmer + English only.
    setLangDropdownOpen(false);
  }, []);

  const removeLanguage = useCallback((code: LangCode) => {
    // Prevent removing Khmer (default) and English from the form.
    if (code === DEFAULT_LANGUAGE || code === "en") return;
    setTranslations((prev) => prev.filter((translation) => translation.language !== code));
    setActiveTab(DEFAULT_LANGUAGE);
  }, []);

  useEffect(() => {
    if (usedCodes.includes(activeTab) || translations.length === 0) return;
    const fallback = translations.find((translation) => translation.language === DEFAULT_LANGUAGE) ?? translations[0];
    if (fallback) setActiveTab(fallback.language);
  }, [activeTab, translations, usedCodes]);

  function validate() {
    const nextErrors: Errors = {};

    const translationErrors: Record<LangCode, { title?: string; category?: string }> = {};
    let firstInvalidTab: LangCode | null = null;
    let hasKmTitle = false;

    translations.forEach((translation) => {
      const errs: { title?: string; category?: string } = {};
      if (!translation.title.trim()) {
        errs.title = t("errors.titleRequired");
        if (!firstInvalidTab) firstInvalidTab = translation.language;
      }

      if ((!(translation.categoryLabel && translation.categoryLabel.trim())) && (!(translation.categoryValue && translation.categoryValue.trim()))) {
        errs.category = t("errors.categoryRequired");
        if (!firstInvalidTab) firstInvalidTab = translation.language;
      }

      if (translation.language === DEFAULT_LANGUAGE && translation.title.trim()) {
        hasKmTitle = true;
      }

      if (Object.keys(errs).length) translationErrors[translation.language] = errs;
    });

    if (!hasKmTitle) {
      translationErrors[DEFAULT_LANGUAGE] = {
        ...(translationErrors[DEFAULT_LANGUAGE] ?? {}),
        title: t("errors.defaultTitleRequired"),
      };
      firstInvalidTab = firstInvalidTab ?? DEFAULT_LANGUAGE;
    }

    if (Object.keys(translationErrors).length) {
      nextErrors.translations = translationErrors;
    }

    setErrors(nextErrors);
    if (firstInvalidTab) setActiveTab(firstInvalidTab);

    return Object.keys(nextErrors).length === 0;
  }

  function resetForm() {
    setPublicationDate(initialPublication?.publicationDate?.split("T")[0] ?? "");
    setTranslations(buildInitialTranslations(initialPublication));
    setActiveTab(DEFAULT_LANGUAGE);
    setCatDropdownOpen(false);
    setLangDropdownOpen(false);
    setErrors({});
    setToast(null);
    setSaving(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    if (status === "loading" || !session?.accessToken) {
      setToast({ message: t("toast.error"), type: "error" });
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();
      // derive top-level category from default language translation (keeps backend compatible)
      const defaultTranslation = getTranslation(DEFAULT_LANGUAGE);
      const defaultCategory =
        (defaultTranslation.categoryValue && defaultTranslation.categoryValue.trim()) ||
        (defaultTranslation.categoryLabel && defaultTranslation.categoryLabel.trim()) ||
        (translations[0]?.categoryValue && translations[0]?.categoryValue.trim()) ||
        (translations[0]?.categoryLabel && translations[0]?.categoryLabel.trim()) ||
        "";
      form.append("Category", defaultCategory);
      if (publicationDate) form.append("PublicationDate", publicationDate);

      translations.forEach((translation, index) => {
        form.append(`Translations[${index}].Language`, translation.language);
        form.append(`Translations[${index}].Title`, translation.title);
        if (translation.content.trim()) form.append(`Translations[${index}].Content`, translation.content.trim());
        const catVal = (translation.categoryValue && translation.categoryValue.trim()) || (translation.categoryLabel && translation.categoryLabel.trim());
        if (catVal) {
          form.append(`Translations[${index}].Category`, catVal);
        }
        if (translation.attachmentFile) {
          form.append(`Translations[${index}].AttachmentFile`, translation.attachmentFile, `${translation.language}.pdf`);
        }
      });

      const backendUrl = getBackendUrl();
      const url = isEditing && initialPublication?.id
        ? `${backendUrl}/api/publications/${initialPublication.id}`
        : `${backendUrl}/api/publications`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: form,
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!res.ok) {
        const message = await extractErrorMessage(res, t("toast.error"));
        throw new Error(message);
      }

      setToast({ message: t("toast.success"), type: "success" });
      if (!isEditing) resetForm();
      onSaved?.();
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : t("toast.error");
      setToast({ message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  const activeTranslation = getTranslation(activeTab);
  const defaultMissing = useMemo(
    () => activeTab !== DEFAULT_LANGUAGE && !getTranslation(DEFAULT_LANGUAGE).title.trim(),
    [activeTab, getTranslation],
  );

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("categoryLabel")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={activeTranslation.categoryLabel ?? activeTranslation.categoryValue ?? ""}
                placeholder={t("categoryPlaceholder")}
                onFocus={() => setCatDropdownOpen(true)}
                onClick={() => setCatDropdownOpen(true)}
                onChange={(e) => {
                  updateTranslation(activeTab, { categoryLabel: e.target.value, categoryValue: "" });
                }}
                className={`w-full pr-10 px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                  errors.translations?.[activeTab]?.category ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                }`}
              />
              <button
                type="button"
                aria-label={t("categoryLabel")}
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className="dropdown-toggle absolute inset-y-0 right-0 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <svg className={`w-4 h-4 transition-transform ${catDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <Dropdown isOpen={catDropdownOpen} onClose={() => setCatDropdownOpen(false)} className="w-full left-0 origin-top">
              {CATEGORY_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => {
                    updateTranslation(activeTab, { categoryValue: option.value, categoryLabel: t(option.labelKey) });
                    setCatDropdownOpen(false);
                  }}
                >
                  {t(option.labelKey)}
                </DropdownItem>
              ))}
            </Dropdown>
            {errors.translations?.[activeTab]?.category && (
              <p className="text-xs text-red-500 mt-1">{errors.translations[activeTab].category}</p>
            )}
          </div>

          <div>
            <DatePicker
              id={isEditing ? "publication-date-edit" : "publication-date"}
              label={t("publishDateLabel")}
              placeholder={t("publishDatePlaceholder")}
              defaultDate={publicationDate || undefined}
              onChange={(_selectedDates: Date[], dateStr: string) => setPublicationDate(dateStr)}
            />
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
            {translations.map((translation) => {
              const status = tabStatus(translation.language);
              const isActive = translation.language === activeTab;

              return (
                <div key={translation.language} className="flex items-center group relative min-w-max">
                  <button
                    type="button"
                    onClick={() => setActiveTab(translation.language)}
                    className={`whitespace-nowrap flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full inline-block ${status === "complete" ? "bg-green-500" : "bg-gray-300 group-hover:bg-gray-400"} transition-colors duration-200`} />
                    <span>{langLabel(translation.language)}</span>
                    {translation.language === DEFAULT_LANGUAGE && (
                      <span className="text-[10px] leading-tight text-gray-400 font-normal ml-0.5 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide">
                        {t("defaultBadge")}
                      </span>
                    )}
                  </button>
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
                  {availableLangs.map((language) => (
                    <DropdownItem key={language.code} onClick={() => addLanguage(language.code as LangCode)}>
                      {language.label}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
            )}
          </nav>
        </div>

        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
          {defaultMissing && (
            <div className="rounded-md bg-yellow-50 p-2.5 border border-yellow-200 flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-yellow-800">{t("missingDefaultWarning")}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t("titleLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={activeTranslation.title}
                placeholder={t("titlePlaceholder", { language: langLabel(activeTab) })}
                onChange={(e) => updateTranslation(activeTab, { title: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                  errors.translations?.[activeTab]?.title ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                }`}
              />
              {errors.translations?.[activeTab]?.title && (
                <p className="text-xs text-red-500 mt-1">{errors.translations[activeTab].title}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-900">
                  {t("contentLabel")} <span className="text-gray-400 font-normal">({t("optional")})</span>
                </label>
                <span className={`text-[11px] ${activeTranslation.content.length > CONTENT_MAX_LENGTH ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {activeTranslation.content.length}/{CONTENT_MAX_LENGTH}
                </span>
              </div>
              <textarea
                value={activeTranslation.content}
                placeholder={t("contentPlaceholder")}
                maxLength={CONTENT_MAX_LENGTH}
                onChange={(e) => updateTranslation(activeTab, { content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y border-gray-300 hover:border-gray-400"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t("attachmentLabel")} <span className="text-gray-400 font-normal">({t("attachmentOptional")})</span>
              </label>
              <AttachmentDropZone
                file={activeTranslation.attachmentFile}
                onChange={(file) => updateTranslation(activeTab, { attachmentFile: file })}
              />

              {activeTranslation.existingAttachmentUrl && !activeTranslation.attachmentFile && (
                <a
                  className="mt-2 inline-flex text-xs text-blue-600 hover:underline"
                  href={resolveAttachmentUrl(activeTranslation.existingAttachmentUrl) ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("currentAttachment")}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-gray-400">{t("progress", { complete: completeCount, total: translations.length })}</span>
          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (resetOnClose) resetForm();
                onClose?.();
              }}
              className="inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-primary bg-white border border-primary hover:bg-gray-50 transition-all"
            >
              {t("close")}
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all ${
                saving ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              {saving ? t("saving") : isEditing ? t("saveEdit") : t("save")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
