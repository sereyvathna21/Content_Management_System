"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/tables/Pagination";

import NewsForm from "@/components/news/NewsForm";
import NewsTable, { NewsArticle } from "@/components/news/NewsTable";
import NewsFilters from "@/components/news/NewsFilters";
import { pickTranslation } from "@/lib/pickTranslation";

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

export default function NewsPage() {
  const locale = useLocale();
  const { data: session, status } = useSession();

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [createOpen, setCreateOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (status === "loading" || !session?.accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (query.trim()) params.set("q", query.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      
      const res = await fetch(`${getBackendUrl()}/api/admin/news?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${session.accessToken}` },
        signal
      });
      if (!res.ok) return;
      const data = await res.json();
      if (signal?.aborted) return;
      
      setNews(data.items ?? []);
      setTotalCount(Number(data.total ?? data.items?.length ?? 0));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, pageSize, query, session?.accessToken, status]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function handleCreated() {
    setCreateOpen(false);
    setEditingNews(null);
    if (page !== 1) {
      setPage(1);
    } else {
      load();
    }
  }

  function handleOpenCreate() {
    setEditingNews(null);
    setCreateOpen(true);
  }

  async function handleDelete(id: string) {
    if (status === "loading" || !session?.accessToken || deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${getBackendUrl()}/api/admin/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }



  const currentLocale = locale || "en";
  const selectedTranslation = selectedNews
    ? pickTranslation(
        selectedNews.translations.map((t) => ({ ...t, description: t.excerpt })),
        currentLocale,
        `News #${selectedNews.id}`
      )
    : null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl sm:text-3xl text-primary font-semibold mb-4">News Management</h1>
      </div>

      <ComponentCard title="News Articles" desc="Manage news articles and translations">
        <div className="mt-2">
          <div className="mb-4">
            <NewsFilters
              query={query}
              onSearch={setQuery}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              action={
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="h-10 px-5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md text-sm w-full sm:w-auto whitespace-nowrap"
                >
                  Create News
                </button>
              }
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <NewsTable
              loading={loading}
              news={news}
              query={query}
              locale={currentLocale}
              onOpen={(n) => { setSelectedNews(n); setViewOpen(true); }}
              onEdit={(n) => { setEditingNews(n); setCreateOpen(true); }}
              onDelete={handleDelete}
              deletingId={deletingId}
              onCreate={handleOpenCreate}
              createLabel="Create News"
              showInlineCreate={false}
            />
            {totalPages > 1 && !loading && (
              <div className="mt-4 flex justify-end">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </ComponentCard>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-3">
          {editingNews ? "Edit News Article" : "Create News Article"}
        </h3>
        <NewsForm
          initialNews={editingNews}
          onSaved={handleCreated}
          onClose={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {selectedNews && selectedTranslation && (
          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedTranslation.title}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedNews.category}
              {selectedNews.publishAt ? ` • Published: ${new Date(selectedNews.publishAt).toLocaleDateString()}` : ""}
              {` • Status: ${selectedNews.status}`}
            </p>
            
            {selectedNews.imageUrl && (
              <div className="mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedNews.imageUrl.split(',').filter(Boolean).map((url, idx) => (
                    <img key={idx} src={url.startsWith("http") ? url : `${getBackendUrl()}${url}`} alt="" className="w-full h-auto rounded-lg object-cover aspect-video" />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {selectedNews.translations.map((t) => (
                <div key={t.language} className="p-4 border rounded-lg bg-gray-50">
                  <div className="font-medium text-lg mb-2">
                    [{t.language.toUpperCase()}] {t.title}
                  </div>
                  <div className="text-sm text-gray-700 font-medium mb-2">{t.excerpt}</div>
                  {t.contentHtml && (
                    <div className="text-sm text-gray-600 mt-2 p-3 bg-white border rounded prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: t.contentHtml }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
