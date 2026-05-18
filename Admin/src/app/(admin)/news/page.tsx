"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/tables/Pagination";

import NewsForm from "@/components/news/NewsForm";
import NewsTable, { NewsArticle } from "@/components/news/NewsTable";
import NewsFilters from "@/components/news/NewsFilters";
import { pickTranslation } from "@/lib/pickTranslation";
import { resolveBackendUrl } from "@/lib/backend";
import { useAdminPagedList } from "@/hooks/useAdminPagedList";

export default function NewsPage() {
  const locale = useLocale();
  const t = useTranslations("NewsPage");
  const { data: session, status } = useSession();

  const {
    items: news,
    loading,
    error,
    totalPages,
    page,
    setPage,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    reload,
  } = useAdminPagedList<NewsArticle>({
    endpoint: "/api/admin/news",
    accessToken: session?.accessToken,
    authStatus: status,
    pageSize: 10,
    loadErrorText: t("loadError"),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreated() {
    setCreateOpen(false);
    setEditingNews(null);
    if (page !== 1) {
      setPage(1);
    } else {
      reload();
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
      const res = await fetch(`${resolveBackendUrl("/api/admin/news/")}${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      reload();
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
        <h1 className="text-2xl sm:text-3xl text-primary font-semibold mb-4">{t("title")}</h1>
      </div>

      <ComponentCard title={t("card.title")} desc={t("card.desc")}>
        <div className="mt-2">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error.message}
            </div>
          )}
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
                  {t("create")}
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
              createLabel={t("create")}
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
          {editingNews ? t("modalEditTitle") : t("modalCreateTitle")}
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
              {selectedNews.publishAt
                ? ` • Published: ${new Date(selectedNews.publishAt).toLocaleDateString(
                    currentLocale === "km" ? "km-KH" : "en-US",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}`
                : ""}
              {` • Status: ${selectedNews.status}`}
            </p>
            
            {selectedNews.imageUrl && (
              <div className="mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedNews.imageUrl.split(',').filter(Boolean).map((url, idx) => (
                    <img
                      key={idx}
                      src={resolveBackendUrl(url)}
                      alt={
                        (currentLocale === "km" ? selectedNews.imageAltKh : selectedNews.imageAltEn) ||
                        selectedNews.imageAltKh ||
                        selectedNews.imageAltEn ||
                        ""
                      }
                      className="w-full h-auto rounded-lg object-cover aspect-video"
                    />
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
