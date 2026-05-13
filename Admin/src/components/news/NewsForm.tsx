"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DatePicker from "@/components/form/date-picker";
import MultiImageDropZone from "./MultiImageDropZone";
import { NewsArticle } from "./NewsTable";
import Select from "@/components/form/Select";

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

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

function formatDateToIso(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NewsForm({ onSaved, onClose, resetOnClose = true, initialNews }: NewsFormProps) {
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
  const [imageAltKh, setImageAltKh] = useState(initialNews?.imageAltKh ?? "");
  const [imageAltEn, setImageAltEn] = useState(initialNews?.imageAltEn ?? "");
  
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
    setImageAltKh(initialNews?.imageAltKh ?? "");
    setImageAltEn(initialNews?.imageAltEn ?? "");
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
    setImageAltKh("");
    setImageAltEn("");
    setTranslations(buildInitialTranslations(null));
    setActiveTab(DEFAULT_LANGUAGE);
    setError(null);
    setSaving(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const kmTrans = getTranslation(DEFAULT_LANGUAGE);
    if (!slug.trim() || !category || !kmTrans.title.trim() || !kmTrans.excerpt.trim()) {
      setError(`Slug, Category, and ${langLabel(DEFAULT_LANGUAGE)} Title and Excerpt are required.`);
      return;
    }

    if (newsStatus === "Published") {
      if (!publishAt) {
        setError("Publish Date is required when status is Published.");
        return;
      }
      if (existingImageUrls.length === 0 && imageFiles.length === 0) {
        setError("Image is required before publishing.");
        return;
      }
      if (!imageAltKh.trim()) {
        setError("Image Alt (Khmer) is required when an image is set.");
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
          if (!res.ok) throw new Error("Failed to upload an image.");
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
        imageAltKh: imageAltKh.trim() || null,
        imageAltEn: imageAltEn.trim() || null,
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
        let message = "Failed to save news article.";
        try {
          const data = await res.json();
          if (typeof data === "string") {
            message = data;
          } else if (data && typeof data === "object") {
            const obj = data as { message?: string; error?: string; detail?: string; errors?: Record<string, unknown> };
            message = obj.message || obj.error || obj.detail || message;
            if (obj.errors && typeof obj.errors === "object") {
              const values = Object.values(obj.errors).flatMap((value) => (Array.isArray(value) ? value : [value]));
              const joined = values.filter(Boolean).map(String).join(", ");
              if (joined) message = joined;
            }
          }
        } catch {
          // ignore parse errors and keep fallback message
        }
        throw new Error(message);
      }

      if (!isEditing && resetOnClose) resetForm();
      onSaved?.();
    } catch (err: any) {
      setError(err.message || "Failed to save news article.");
    } finally {
      setSaving(false);
    }
  }

  const activeTranslation = getTranslation(activeTab);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-h-[65vh] overflow-y-auto">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[15px] font-medium text-gray-900 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="url-friendly-slug"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-[15px] font-medium text-gray-900 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative z-20">
              <Select
                value={category}
                onChange={setCategory}
                options={CATEGORY_OPTIONS.map(opt => ({ value: opt, label: opt }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[15px] font-medium text-gray-900 mb-2">
              Status
            </label>
            <div className="relative z-10">
              <Select
                value={newsStatus}
                onChange={setNewsStatus}
                options={[
                  { value: "Draft", label: "Draft" },
                  { value: "Published", label: "Published" },
                  { value: "Archived", label: "Archived" }
                ]}
              />
            </div>
          </div>
          
          <div>
            <DatePicker
              id={isEditing ? "news-date-edit" : "news-date"}
              label="Publish Date"
              placeholder="Select date"
              defaultDate={publishAt || undefined}
              onChange={(selectedDates: Date[]) =>
                setPublishAt(selectedDates[0] ? formatDateToIso(selectedDates[0]) : "")
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-[15px] font-medium text-gray-900 mb-2">
            Gallery Images
          </label>
          
          {existingImageUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Already Uploaded:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {existingImageUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img src={url.startsWith("http") ? url : `${getBackendUrl()}${url}`} alt="Preview" className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingImageUrls(existingImageUrls.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <MultiImageDropZone files={imageFiles} onChange={setImageFiles} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[15px] font-medium text-gray-900 mb-2">
              Image Alt (Khmer) <span className="text-red-500">{newsStatus === "Published" ? "*" : ""}</span>
            </label>
            <input
              type="text"
              value={imageAltKh}
              onChange={(e) => setImageAltKh(e.target.value)}
              placeholder="Describe the image in Khmer"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[15px] font-medium text-gray-900 mb-2">
              Image Alt (English)
            </label>
            <input
              type="text"
              value={imageAltEn}
              onChange={(e) => setImageAltEn(e.target.value)}
              placeholder="Describe the image in English"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>

        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {DEFAULT_LANGS.map((lang) => {
              const isActive = lang === activeTab;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={`whitespace-nowrap flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{langLabel(lang)}</span>
                  {lang === DEFAULT_LANGUAGE && (
                    <span className="text-[10px] leading-tight text-gray-400 font-normal ml-0.5 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide">
                      Default
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
          <div>
            <label className="block text-[15px] font-medium text-gray-900 mb-2">
              Title <span className="text-red-500">{activeTab === DEFAULT_LANGUAGE ? "*" : ""}</span>
            </label>
            <input
              type="text"
              value={activeTranslation.title}
              onChange={(e) => updateTranslation(activeTab, { title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[15px] font-medium text-gray-900 mb-2">
              Excerpt <span className="text-red-500">{activeTab === DEFAULT_LANGUAGE ? "*" : ""}</span>
            </label>
            <textarea
              value={activeTranslation.excerpt}
              onChange={(e) => updateTranslation(activeTab, { excerpt: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y"
            />
          </div>
          
          <div>
            <label className="block text-[15px] font-medium text-gray-900 mb-2">
              Content (HTML)
            </label>
            <textarea
              value={activeTranslation.contentHtml}
              onChange={(e) => updateTranslation(activeTab, { contentHtml: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (resetOnClose) resetForm();
                onClose?.();
              }}
              className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Article"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
