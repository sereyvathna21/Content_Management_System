"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/tables/Pagination";
import LawTable from "@/components/laws/LawTable";
import LawForm from "@/components/laws/LawForm";
import { useLaws } from "@/hooks/useLaws";
import type { Law } from "@/hooks/useLaws";

export default function LawsPage() {
  const t = useTranslations("LawsPage");
  const {
    laws,
    loading,
    saving,
    error,
    categories,
    query,
    categoryFilter,
    page,
    totalPages,
    totalCount,
    loadLaws,
    createLaw,
    updateLaw,
    deleteLaw,
    setQuery,
    setCategoryFilter,
    setPage,
  } = useLaws();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Law | null>(null);

  useEffect(() => {
    loadLaws();
  }, []);

  function handleCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(law: Law) {
    setEditing(law);
    setFormOpen(true);
  }

  async function handleSave(payload: Parameters<typeof createLaw>[0]) {
    if (editing) {
      const ok = await updateLaw(editing.id, payload);
      if (ok) setFormOpen(false);
    } else {
      const created = await createLaw(payload);
      if (created) setFormOpen(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteLaw(id);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl text-primary font-semibold mb-4">{t("admin.title")}</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ComponentCard title={`${t("admin.card.title")} (${totalCount})`} desc={t("admin.card.desc")} className="mt-2">
        {/* Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center mb-4">
          <div className="flex gap-2 items-center flex-wrap">
            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
              aria-label={t("admin.filterByCategory")}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full">
            <input
              placeholder={t("admin.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("admin.searchPlaceholder")}
              className={`w-full sm:w-64 h-9 px-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 text-sm ${
                query ? "border-gray-300" : "border-gray-200"
              } bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-500`}
            />
            <Button
              onClick={handleCreate}
              className="h-9 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm w-full sm:w-auto sm:ml-2"
            >
              {t("admin.createButton")}
            </Button>
          </div>
        </div>

        <LawTable
          loading={loading}
          laws={laws}
          query={query}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClear={() => setQuery("")}
        />

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        )}
      </ComponentCard>

      <LawForm
        open={formOpen}
        initial={editing}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
