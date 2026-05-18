"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import DatePicker from "@/components/form/date-picker";
import { Video } from "./VideoTable";
import Select from "@/components/form/Select";
import { getBackendUrl } from "@/lib/backend";
import { readApiError } from "@/lib/readApiError";

interface VideoFormProps {
  onSaved?: () => void;
  onClose?: () => void;
  resetOnClose?: boolean;
  initialVideo?: Video | null;
}

const CATEGORY_OPTIONS = [
  "Featured",
  "News",
  "Event",
  "Interview",
];

function formatDateToIso(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeEmbedInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const srcMatch = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcMatch?.[1]) {
    return srcMatch[1].trim();
  }

  const urlMatch = trimmed.match(/https?:\/\/[^"'\s<>]+/i);
  if (urlMatch?.[0]) {
    const url = urlMatch[0].trim();
    return normalizeToEmbedUrl(url);
  }

  return normalizeToEmbedUrl(trimmed);
}

function parseYouTubeTimeToSeconds(input: string | null): number | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  // Accept plain seconds.
  if (/^\d+$/.test(raw)) {
    const seconds = Number(raw);
    return Number.isFinite(seconds) ? seconds : null;
  }

  // Accept formats like 1h2m3s, 90s, 3m.
  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  const seconds = match[3] ? Number(match[3]) : 0;
  const total = hours * 3600 + minutes * 60 + seconds;
  return Number.isFinite(total) && total > 0 ? total : null;
}

function normalizeToEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    const isYouTube = host.includes("youtube.com") || host === "youtu.be";
    if (!isYouTube) return url;

    // Extract video ID from common formats.
    let videoId: string | null = null;

    if (host === "youtu.be") {
      // https://youtu.be/<id>
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    } else {
      const path = parsed.pathname;
      if (path.startsWith("/watch")) {
        videoId = parsed.searchParams.get("v");
      } else if (path.startsWith("/embed/")) {
        videoId = path.split("/").filter(Boolean)[1] ?? null;
      } else if (path.startsWith("/shorts/")) {
        videoId = path.split("/").filter(Boolean)[1] ?? null;
      }
    }

    if (!videoId) return url;

    const start =
      parseYouTubeTimeToSeconds(parsed.searchParams.get("start")) ??
      parseYouTubeTimeToSeconds(parsed.searchParams.get("t"));

    const embed = new URL(`https://www.youtube.com/embed/${videoId}`);
    if (start != null) {
      embed.searchParams.set("start", String(start));
    }
    return embed.toString();
  } catch {
    return url;
  }
}

function isAllowedVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return (
      host.includes("youtube.com") ||
      host === "youtu.be" ||
      host.includes("vimeo.com") ||
      host.includes("facebook.com")
    );
  } catch {
    return false;
  }
}

export default function VideoForm({ onSaved, onClose, resetOnClose = true, initialVideo }: VideoFormProps) {
  const t = useTranslations("VideoForm");
  const { data: session, status } = useSession();
  const isEditing = Boolean(initialVideo?.id);

  const [title, setTitle] = useState(initialVideo?.title ?? "");
  const [description, setDescription] = useState(initialVideo?.description ?? "");
  const [embedUrl, setEmbedUrl] = useState(initialVideo?.embedUrl ?? "");
  const [category, setCategory] = useState(initialVideo?.category ?? CATEGORY_OPTIONS[0]);
  const [videoStatus, setVideoStatus] = useState(initialVideo?.status ?? "Draft");
  const [publishAt, setPublishAt] = useState(initialVideo?.publishAt?.split("T")[0] ?? "");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialVideo?.title ?? "");
    setDescription(initialVideo?.description ?? "");
    setEmbedUrl(initialVideo?.embedUrl ?? "");
    setCategory(initialVideo?.category ?? CATEGORY_OPTIONS[0]);
    setVideoStatus(initialVideo?.status ?? "Draft");
    setPublishAt(initialVideo?.publishAt?.split("T")[0] ?? "");
    setError(null);
    setSaving(false);
  }, [initialVideo]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEmbedUrl("");
    setCategory(CATEGORY_OPTIONS[0]);
    setVideoStatus("Draft");
    setPublishAt("");
    setError(null);
    setSaving(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmbedUrl = normalizeEmbedInput(embedUrl);

    if (!title.trim()) {
      setError(t("errors.titleRequired"));
      return;
    }
    if (!normalizedEmbedUrl) {
      setError(t("errors.embedUrlRequired"));
      return;
    }

    if (!isAllowedVideoUrl(normalizedEmbedUrl)) {
      setError(t("errors.embedUrlNotAllowed"));
      return;
    }
    if (!category) {
      setError(t("errors.categoryRequired"));
      return;
    }

    if (!description.trim()) {
      setError(t("errors.descriptionRequired"));
      return;
    }

    if (videoStatus === "Published") {
      if (!publishAt) {
        setError(t("errors.publishDateRequired"));
        return;
      }
    }
    
    if (status === "loading" || !session?.accessToken) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        embedUrl: normalizedEmbedUrl,
        category,
        status: videoStatus,
        publishAt: publishAt ? new Date(`${publishAt}T00:00:00Z`).toISOString() : null,
        featured: false,
      };

      const url = isEditing && initialVideo?.id
        ? `${getBackendUrl()}/api/admin/videos/${initialVideo.id}`
        : `${getBackendUrl()}/api/admin/videos`;

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

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("titleLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
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
                options={CATEGORY_OPTIONS.map(opt => ({ value: opt, label: opt }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("embedUrlLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={embedUrl}
              onChange={(e) => {
                setEmbedUrl(normalizeEmbedInput(e.target.value));
              }}
              placeholder={t("embedUrlPlaceholder")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t("statusLabel")}
            </label>
            <div className="relative z-10">
              <Select
                value={videoStatus}
                onChange={setVideoStatus}
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
              id={isEditing ? "video-date-edit" : "video-date"}
              label={t("publishDateLabel")}
              placeholder={t("publishDatePlaceholder")}
              defaultDate={publishAt || undefined}
              onChange={(selectedDates: Date[]) =>
                setPublishAt(selectedDates[0] ? formatDateToIso(selectedDates[0]) : "")
              }
            />
          </div>
        </div>

        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {t("descriptionLabel")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("descriptionPlaceholder")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y"
          />
        </div>

        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="w-full sm:w-auto flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => {
                if (resetOnClose) resetForm();
                onClose?.();
              }}
              className="inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-primary bg-white border border-primary hover:bg-gray-50 transition-all"
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
