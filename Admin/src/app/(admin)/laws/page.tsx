"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import LawForm from "@/components/laws/LawForm";
import LawTable, { Law as LawType } from "@/components/laws/LawTable";
import LawFilters from "@/components/laws/LawFilters";
import { pickTranslation } from "@/lib/pickTranslation";
import Pagination from "@/components/tables/Pagination";


type LawTranslation = {
  id: string;
  language: string;
  title: string;
  category?: string;
  description?: string;
  pdfUrl?: string;
};

type Law = {
  id: string;
  category?: string;
  date?: string;
  translations: LawTranslation[];
};

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
}

function resolvePdfUrl(pdfUrl?: string) {
  if (!pdfUrl) return null;
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
  return `${backendUrl}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`;
}

export default function LawsPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLaw, setSelectedLaw] = useState<LawType | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingLaw, setEditingLaw] = useState<LawType | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const locale = useLocale();
  const pageSize = 10;

  const load = useCallback(async (signal?: AbortSignal) => {
    if (status === "loading" || !session?.accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (query.trim()) params.set("q", query.trim());
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const res = await fetch(`${getBackendUrl()}/api/laws?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${session.accessToken}`
        },
        signal
      });
      if (!res.ok) return;
      const data = (await res.json()) as { total?: number; items?: Law[] };
      if (signal?.aborted) return;
      const items = data.items ?? [];
      setLaws(
        items.map((item) => ({
          id: item.id,
          category: item.category,
          date: item.date,
          translations: (item.translations ?? []).map((translation) => ({
            id: translation.id,
            language: translation.language,
            title: translation.title,
            category: translation.category,
            description: translation.description,
            pdfUrl: translation.pdfUrl,
          })),
        })),
      );
      setTotalCount(Number(data.total ?? items.length));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, page, pageSize, query, session?.accessToken, status]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function handleCreated() {
    setCreateOpen(false);
    setEditingLaw(null);
    if (page !== 1) {
      setPage(1);
      return;
    }
    load();
  }

  function handleOpenCreate() {
    setEditingLaw(null);
    setCreateOpen(true);
  }

  function handleCloseCreate() {
    setCreateOpen(false);
    setEditingLaw(null);
  }

  async function handleDelete(id: string) {
    if (status === "loading" || !session?.accessToken || deletingId) return;
    setDeletingId(id);
    try
    {
      const res = await fetch(`${getBackendUrl()}/api/laws/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      await load();
    }
    catch (err)
    {
      console.error(err);
    }
    finally
    {
      setDeletingId(null);
    }
  }

  const currentLocale = locale || "en";
  const selectedTranslation = selectedLaw
    ? pickTranslation(
        selectedLaw.translations.map((translation) => ({
          id: translation.id,
          language: translation.language,
          title: translation.title,
          category: translation.category,
          description: translation.description,
          pdfUrl: translation.pdfUrl,
        })),
        currentLocale,
        `Law #${selectedLaw.id}`,
      )
    : null;

  const categoryOptions = useMemo(() => [
    { value: "all", label: t("LawsPage.filters.all") },
    { value: "Royal Degree", label: t("LawsPage.filters.categories.royalDegree") },
    { value: "Sub-Degree", label: t("LawsPage.filters.categories.subDegree") },
    { value: "Prakas", label: t("LawsPage.filters.categories.prakas") },
    { value: "Decision and Guideline", label: t("LawsPage.filters.categories.decisionAndGuideline") },
  ], [t]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query, categoryFilter]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl text-primary font-semibold mb-4">{t("LawsPage.title") || "Laws"}</h1>
      </div>

      <ComponentCard
        title={t("LawsPage.card.title") || "Laws"}
        desc={t("LawsPage.card.desc") || "Manage laws and translations"}
      >
       
        <div className="mt-2">
          <div className="mb-4">
            <LawFilters
              query={query}
              onSearch={(value) => {
                setQuery(value);
                setPage(1);
              }}
              category={categoryFilter}
              onCategoryChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
              categories={categoryOptions}
              action={
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="h-9 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm w-full sm:w-auto"
                >
                  {t("LawsPage.create") || "New Law"}
                </button>
              }
            />
          </div>
          
          {loading ? (
            <div>{t("LawTable.loading")}</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <LawTable
                loading={loading}
                laws={laws}
                query={query}
                locale={currentLocale}
                onOpen={(l) => { setSelectedLaw(l); setViewOpen(true); }}
                onEdit={(l) => { setEditingLaw(l); setCreateOpen(true); }}
                onDelete={handleDelete}
                deletingId={deletingId}
                onCreate={handleOpenCreate}
                createLabel={t("LawsPage.create") || "New Law"}
                showInlineCreate={false}
              />
              {totalPages > 1 && (
                <div className="mt-4 flex justify-end">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
            
          )}
        </div>
      </ComponentCard>

      <Modal isOpen={createOpen} onClose={handleCloseCreate} className="max-w-4xl p-4">
        <h3 className="text-lg font-semibold mb-3">
          {editingLaw ? (t("LawsPage.edit") || "Edit Law") : (t("LawsPage.create") || "Create Law")}
        </h3>
        <LawForm
          initialLaw={
            editingLaw
              ? {
                  id: editingLaw.id,
                  category: editingLaw.category,
                  date: editingLaw.date,
                  translations: editingLaw.translations.map((translation) => ({
                    language: translation.language,
                    title: translation.title,
                    category: translation.category,
                    description: translation.description,
                    pdfUrl: translation.pdfUrl,
                  })),
                }
              : null
          }
          onSaved={handleCreated}
          onClose={handleCloseCreate}
        />
      </Modal>

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} className="max-w-2xl p-6">
        {selectedLaw && selectedTranslation && (
          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedTranslation.title}</h3>
            <p className="text-sm text-gray-600">
              {selectedTranslation?.category ?? selectedLaw.category ?? "-"}
              {selectedLaw.date ? ` • ${new Date(selectedLaw.date).toLocaleDateString(currentLocale === "km" ? "km-KH" : "en-US")}` : ""}
            </p>

            <div className="mt-3 space-y-2">
              {selectedLaw.translations.map((translation) => {
                const pdfHref = resolvePdfUrl(translation.pdfUrl);
                return (
                  <div key={translation.language} className="p-3 border rounded-lg">
                    <div className="font-medium">
                      {translation.language.toUpperCase()} - {translation.title}
                    </div>
                    {translation.description && <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">{translation.description}</div>}
                    {pdfHref ? (
                      <a className="inline-flex mt-2 text-sm text-blue-600 hover:underline" href={pdfHref} target="_blank" rel="noreferrer">
                        {t("LawsPage.viewPdf") || "View PDF"}
                      </a>
                    ) : (
                      <div className="text-sm text-gray-400 mt-2">{t("LawTable.noPdf")}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
