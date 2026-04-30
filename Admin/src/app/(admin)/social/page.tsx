"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import SocialTopicTable, { SocialTopic } from "@/components/social/SocialTopicTable";
import SocialFilters from "@/components/social/SocialFilters";


function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

export default function SocialPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session, status } = useSession();
   const [deletingId, setDeletingId] = useState<string | null>(null);
  const [topics, setTopics] = useState<SocialTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const locale = useLocale();

  // Create form state
  const [slug, setSlug] = useState("");
  const [titleKm, setTitleKm] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<SocialTopic | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    if (status === "loading" || !session?.accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/admin/social/topics`, {
        headers: { "Authorization": `Bearer ${session.accessToken}` },
        signal
      });
      if (!res.ok) return;
      const data = (await res.json()) as SocialTopic[];
      if (signal?.aborted) return;
      setTopics(data);
      setLoadError("");
    } catch (err: any) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setLoadError("Failed to load topics. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const filteredTopics = React.useMemo(() => {
    if (!query.trim()) return topics;
    const q = query.toLowerCase();
    return topics.filter(t => 
      t.slug.toLowerCase().includes(q) ||
      t.titleKm.toLowerCase().includes(q) ||
      t.titleEn?.toLowerCase().includes(q)
    );
  }, [topics, query]);
  function handleDelete(topic: SocialTopic) {
    setSelectedTopic(topic);
    setDeleteError("");
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selectedTopic || status === "loading" || !session?.accessToken) return;
    
    setDeletingId(selectedTopic.id);
    setDeleteError("");
    try {
      const res = await fetch(`${getBackendUrl()}/api/admin/social/topics/${selectedTopic.id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete topic. Please try again.");
      }
      
      setDeleteOpen(false);
      setSelectedTopic(null);
      await load();
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  }
  async function handleCreate(e: React.FormEvent) {
      e.preventDefault();
      if (!titleKm || !slug) {
          setCreateError("Khmer title and slug are required.");
          return;
      }

      setCreating(true);
      setCreateError("");
      try {
        const res = await fetch(`${getBackendUrl()}/api/admin/social/topics`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${session?.accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ slug, titleKm, titleEn })
        });
        
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Failed to create topic");
        }

        const newTopic = await res.json();
        setCreateOpen(false);
        router.push(`/social/${newTopic.id}`);
      } catch (err: any) {
          setCreateError(err.message);
      } finally {
          setCreating(false);
      }
  }

  function handleOpenCreate() {
    setSlug("");
    setTitleKm("");
    setTitleEn("");
    setCreateError("");
    setCreateOpen(true);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl text-primary font-semibold mb-4">{t("SocialPage.title") || "Social Content"}</h1>
      </div>

      <ComponentCard
        title={t("SocialPage.card.title") || "Social Topics"}
        desc={t("SocialPage.card.desc") || "Manage content topics and sections"}
      >
        {loadError && (
          <div className="mb-4">
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {loadError}
            </div>
          </div>
        )}

        <SocialFilters 
          query={query}
          onSearch={setQuery}
          action={
            <button
              onClick={handleOpenCreate}
              className="h-10 px-5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md text-sm whitespace-nowrap"
            >
              {t("SocialPage.create") || "New Topic"}
            </button>
          }
        />

        <div className="mt-2">          
          {loading ? (
            <div>{t("SocialTable.loading") || "Loading..."}</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <SocialTopicTable
                loading={loading}
                topics={filteredTopics}
                query={query}
                locale={locale || "en"}
                onEdit={(t) => router.push(`/social/${t.id}`)}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </ComponentCard>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-w-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{t("SocialPage.create") || "New Topic"}</h3>
        
        {createError && (
             <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                 {createError}
             </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g. assistance"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">This will form the public URL (e.g. /social/assistance)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Khmer Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={titleKm}
                onChange={(e) => setTitleKm(e.target.value)}
                placeholder="ចំណងជើង..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                English Title
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Title..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                    {creating ? "Creating..." : "Create Draft"}
                </button>
            </div>
        </form>
      </Modal>
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} className="max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete Topic.
            This will permanently remove all associated sections and revisions.
          </p>

          {deleteError && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-left">
              {deleteError}
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setDeleteOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={!!deletingId}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {deletingId ? "Deleting..." : "Delete Topic"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
