"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DatePicker from "@/components/form/date-picker";
import ImageDropZone from "../news/ImageDropZone";
import { Video } from "./VideoTable";
import Select from "@/components/form/Select";

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

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

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
    return urlMatch[0].trim();
  }

  return trimmed;
}

export default function VideoForm({ onSaved, onClose, resetOnClose = true, initialVideo }: VideoFormProps) {
  const { data: session, status } = useSession();
  const isEditing = Boolean(initialVideo?.id);

  const [title, setTitle] = useState(initialVideo?.title ?? "");
  const [description, setDescription] = useState(initialVideo?.description ?? "");
  const [embedUrl, setEmbedUrl] = useState(initialVideo?.embedUrl ?? "");
  const [category, setCategory] = useState(initialVideo?.category ?? CATEGORY_OPTIONS[0]);
  const [videoStatus, setVideoStatus] = useState(initialVideo?.status ?? "Draft");
  const [publishAt, setPublishAt] = useState(initialVideo?.publishAt?.split("T")[0] ?? "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(initialVideo?.thumbnailUrl ?? "");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialVideo?.title ?? "");
    setDescription(initialVideo?.description ?? "");
    setEmbedUrl(initialVideo?.embedUrl ?? "");
    setCategory(initialVideo?.category ?? CATEGORY_OPTIONS[0]);
    setVideoStatus(initialVideo?.status ?? "Draft");
    setPublishAt(initialVideo?.publishAt?.split("T")[0] ?? "");
    setExistingThumbnailUrl(initialVideo?.thumbnailUrl ?? "");
    setThumbnailFile(null);
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
    setThumbnailFile(null);
    setExistingThumbnailUrl("");
    setError(null);
    setSaving(false);
  }

  async function uploadThumbnail() {
    if (!thumbnailFile) return null;
    const formData = new FormData();
    formData.append("file", thumbnailFile);
    
    const res = await fetch(`${getBackendUrl()}/api/admin/media/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.accessToken}` },
      body: formData,
    });
    
    if (!res.ok) throw new Error("Failed to upload thumbnail.");
    return await res.json();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmbedUrl = normalizeEmbedInput(embedUrl);

    if (!title.trim() || !normalizedEmbedUrl || !category) {
      setError("Title, Embed URL, and Category are required.");
      return;
    }
    
    if (status === "loading" || !session?.accessToken) return;

    setSaving(true);
    setError(null);

    try {
      let thumbnailMediaId = null;
      let thumbnailUrl = existingThumbnailUrl;

      if (thumbnailFile) {
        const media = await uploadThumbnail();
        thumbnailMediaId = media.id;
        thumbnailUrl = media.publicUrl;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        embedUrl: normalizedEmbedUrl,
        category,
        status: videoStatus,
        publishAt: publishAt ? new Date(`${publishAt}T00:00:00Z`).toISOString() : null,
        thumbnailUrl,
        thumbnailMediaId,
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
        let message = "Failed to save video.";
        try {
          const data = await res.json();
          if (data?.message) {
            message = String(data.message);
          }
        } catch {
          // Ignore JSON parse errors and keep fallback message.
        }
        throw new Error(message);
      }

      if (!isEditing && resetOnClose) resetForm();
      onSaved?.();
    } catch (err: any) {
      setError(err.message || "Failed to save video.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 max-h-[65vh] overflow-y-auto">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
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
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Embed URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={embedUrl}
              onChange={(e) => {
                setEmbedUrl(normalizeEmbedInput(e.target.value));
              }}
              placeholder="e.g. https://www.youtube.com/embed/..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Status
            </label>
            <div className="relative z-10">
              <Select
                value={videoStatus}
                onChange={setVideoStatus}
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
              id={isEditing ? "video-date-edit" : "video-date"}
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
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Thumbnail
          </label>
          <ImageDropZone file={thumbnailFile} onChange={setThumbnailFile} />
          {existingThumbnailUrl && !thumbnailFile && (
            <div className="mt-2 text-sm text-gray-500">
              Current: <a href={existingThumbnailUrl} target="_blank" className="text-blue-500 hover:underline">View Thumbnail</a>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (resetOnClose) resetForm();
                onClose?.();
              }}
              className="inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-primary bg-white border border-primary hover:bg-gray-50 transition-all"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all ${
                saving ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Video"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
