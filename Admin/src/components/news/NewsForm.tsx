"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import DatePicker from "@/components/form/date-picker";
import MultiImageDropZone from "./MultiImageDropZone";
import { NewsArticle } from "./NewsTable";
import Select from "@/components/form/Select";
import { getBackendUrl } from "@/lib/backend";
import { readApiError } from "@/lib/readApiError";

type LangCode = string;

type Translation = {
  language: LangCode;
  title: string;
  excerpt: string;
  contentHtml: string;
};

interface NewsFormProps {
  onSaved?: () => void;
  onClose?: () => void;
  resetOnClose?: boolean;
  initialNews?: NewsArticle | null;
}

const SUPPORTED_LANGUAGES = [
  { code: "km", label: "Khmer" },
  { code: "en", label: "English" },
];

const DEFAULT_LANGUAGE = "km";
const DEFAULT_LANGS = ["km", "en"];
const CATEGORY_OPTIONS = ["National", "International", "Politics", "Economy", "Sports"];

function langLabel(code: string) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)?.label ?? code.toUpperCase();
}

function makeEmptyTranslation(language: string): Translation {
  return {
    language,
    title: "",
    excerpt: "",
    contentHtml: "",
  };
}

function formatDateToIso(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeSlugInput(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewsForm({ onSaved, onClose, resetOnClose = true, initialNews }: NewsFormProps) {
  const t = useTranslations("NewsForm");
  const { data: session, status } = useSession();
  const isEditing = Boolean(initialNews?.id);

  const buildInitialTranslations = useCallback((news?: NewsArticle | null) => {
    const map = new Map<string, Translation>();
    if (news?.translations?.length) {
      news.translations.forEach((tr) => {
        if (tr?.language) {
          const normalized = tr.language.toLowerCase() === "kh" ? "km" : tr.language.toLowerCase();
          map.set(normalized, tr as any);
        }
      });
    }

    return DEFAULT_LANGS.map((lang) => {
      const existing = map.get(lang.toLowerCase());
      return {
        language: lang,
        title: existing?.title ?? "",
        excerpt: existing?.excerpt ?? "",
        contentHtml: existing?.contentHtml ?? "",
      } as Translation;
    });
  }, []);

  const [slug, setSlug] = useState(initialNews?.slug ?? "");
  const [category, setCategory] = useState(initialNews?.category ?? CATEGORY_OPTIONS[0]);
  const [newsStatus, setNewsStatus] = useState(initialNews?.status ?? "Draft");
  const [publishAt, setPublishAt] = useState(initialNews?.publishAt?.split("T")[0] ?? "");
  const [imageAlt, setImageAlt] = useState(initialNews?.imageAltKh ?? initialNews?.imageAltEn ?? "");
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialNews?.imageUrl ? initialNews.imageUrl.split(",").filter(Boolean) : []
  );

  const [activeTab, setActiveTab] = useState<LangCode>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Translation[]>(buildInitialTranslations(initialNews));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSlug(initialNews?.slug ?? "");
    setCategory(initialNews?.category ?? CATEGORY_OPTIONS[0]);
    setNewsStatus(initialNews?.status ?? "Draft");
    setPublishAt(initialNews?.publishAt?.split("T")[0] ?? "");
    setExistingImageUrls(initialNews?.imageUrl ? initialNews.imageUrl.split(",").filter(Boolean) : []);
    setImageAlt(initialNews?.imageAltKh ?? initialNews?.imageAltEn ?? "");
    setTranslations(buildInitialTranslations(initialNews));
    setActiveTab(DEFAULT_LANGUAGE);
    setImageFiles([]);
    setError(null);
    setSaving(false);
  }, [initialNews, buildInitialTranslations]);

  const getTranslation = useCallback(
    (code: LangCode): Translation => translations.find((tr) => tr.language === code) ?? makeEmptyTranslation(code),
    [translations]
  );

  const updateTranslation = useCallback((code: LangCode, patch: Partial<Translation>) => {
    setTranslations((prev) => prev.map((tr) => (tr.language === code ? { ...tr, ...patch } : tr)));
    setError(null);
  }, []);

  function resetForm() {
    setSlug("");
    setCategory(CATEGORY_OPTIONS[0]);
    setNewsStatus("Draft");
    setPublishAt("");
    setImageFiles([]);
    setExistingImageUrls([]);
    setImageAlt("");
    setTranslations(buildInitialTranslations(null));
    setActiveTab(DEFAULT_LANGUAGE);
    setError(null);
    setSaving(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const kmTrans = getTranslation(DEFAULT_LANGUAGE);
    if (!slug.trim() || !category || !kmTrans.title.trim() || !kmTrans.excerpt.trim()) {
      setError(t("errors.required", { language: langLabel(DEFAULT_LANGUAGE) }));
      return;
    }

    if (newsStatus === "Published") {
      if (!publishAt) {
        setError(t("errors.publishDateRequired"));
        return;
      }
      if (existingImageUrls.length === 0 && imageFiles.length === 0) {
        setError(t("errors.imageRequired"));
        return;
      }
      if (!imageAlt.trim()) {
        setError(t("errors.imageAltRequired"));
        return;
      }
    }

    for (const tr of translations) {
      if (tr.language === DEFAULT_LANGUAGE) continue;
      const hasTitle = Boolean(tr.title.trim());
      const hasExcerpt = Boolean(tr.excerpt.trim());
      if (hasTitle !== hasExcerpt) {
        setError(t("errors.translationIncomplete", { language: langLabel(tr.language) }));
        return;
      }
    }
    
    if (status === "loading" || !session?.accessToken) return;

    setSaving(true);
    setError(null);

    try {
      let finalUrls = [...existingImageUrls];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch(`${getBackendUrl()}/api/admin/media/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.accessToken}` },
            body: formData,
          });
          if (!res.ok) throw new Error(t("errors.uploadFailed"));
          const media = await res.json();
          finalUrls.push(media.publicUrl);
        }
      }

      const payload = {
        slug: slug.trim(),
        category,
        status: newsStatus,
        publishAt: publishAt ? new Date(`${publishAt}T00:00:00Z`).toISOString() : null,
        imageUrl: finalUrls.join(","),
        imageMediaId: null, // Multiple images cannot use a single ID
        imageAltKh: imageAlt.trim() || null,
        imageAltEn: imageAlt.trim() || null,
        featured: false,
        translations: translations.filter(tr => tr.title.trim() || tr.excerpt.trim()).map(tr => ({
          language: tr.language,
          title: tr.title.trim(),
          excerpt: tr.excerpt.trim(),
          contentHtml: tr.contentHtml.trim(),
        })),
      };

      const url = isEditing && initialNews?.id
        ? `${getBackendUrl()}/api/admin/news/${initialNews.id}`
        : `${getBackendUrl()}/api/admin/news`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}` 
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, t("errors.saveFailed")));
      }

      if (!isEditing && resetOnClose) resetForm();
      onSaved?.();
    } catch (err: any) {
      setError(err.message || t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const activeTranslation = getTranslation(activeTab);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 max-h-[65vh] overflow-y-auto">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-gray-50/50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("slugLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(normalizeSlugInput(e.target.value))}
              placeholder={t("slugPlaceholder")}
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("categoryLabel")} <span className="text-red-500">*</span>
            </label>
            <div className="relative z-20">
              <Select
                value={category}
                onChange={setCategory}
                options={CATEGORY_OPTIONS.map((opt) => {
                  const key = opt.toLowerCase();
                  return {
                    value: opt,
                    label: t(`categories.${key}`),
                  };
                })}
              />
            </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("statusLabel")}
            </label>
            <div className="relative z-10">
              <Select
                value={newsStatus}
                onChange={setNewsStatus}
                options={[
                  { value: "Draft", label: t("status.draft") },
                  { value: "Published", label: t("status.published") },
                  { value: "Archived", label: t("status.archived") }
                ]}
              />
            </div>
            </div>

            <div>
              <DatePicker
                id={isEditing ? "news-date-edit" : "news-date"}
                label={t("publishDateLabel")}
                placeholder={t("publishDatePlaceholder")}
                defaultDate={publishAt || undefined}
                onChange={(selectedDates: Date[]) =>
                  setPublishAt(selectedDates[0] ? formatDateToIso(selectedDates[0]) : "")
                }
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50/50 p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("galleryImagesLabel")}
            </label>

            {existingImageUrls.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">{t("alreadyUploadedLabel")}:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {existingImageUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={url.startsWith("http") ? url : `${getBackendUrl()}${url}`}
                        alt="Preview"
                        className="w-full h-20 object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => setExistingImageUrls(existingImageUrls.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <MultiImageDropZone files={imageFiles} onChange={setImageFiles} />
        </div>

        <div className="rounded-xl bg-gray-50/50 p-4">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {t("imageAltLabel")} <span className="text-red-500">{newsStatus === "Published" ? "*" : ""}</span>
          </label>
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder={t("imageAltPlaceholder")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
          />
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {DEFAULT_LANGS.map((lang) => {
              const isActive = lang === activeTab;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={`whitespace-nowrap flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{langLabel(lang)}</span>
                  {lang === DEFAULT_LANGUAGE && (
                    <span className="text-[10px] leading-tight text-gray-400 font-normal ml-0.5 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide">
                      {t("defaultBadge")}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-gray-50/50 p-4 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("titleLabel")} <span className="text-red-500">{activeTab === DEFAULT_LANGUAGE ? "*" : ""}</span>
            </label>
            <input
              type="text"
              value={activeTranslation.title}
              onChange={(e) => updateTranslation(activeTab, { title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("excerptLabel")} <span className="text-red-500">{activeTab === DEFAULT_LANGUAGE ? "*" : ""}</span>
            </label>
            <textarea
              value={activeTranslation.excerpt}
              onChange={(e) => updateTranslation(activeTab, { excerpt: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("contentLabel")} (HTML)
            </label>
            <textarea
              value={activeTranslation.contentHtml}
              onChange={(e) => updateTranslation(activeTab, { contentHtml: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y font-mono"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (resetOnClose) resetForm();
                onClose?.();
              }}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-primary bg-white border border-primary hover:bg-gray-50 transition-all"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all ${
                saving ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              {saving ? t("saving") : isEditing ? t("saveEdit") : t("save")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
