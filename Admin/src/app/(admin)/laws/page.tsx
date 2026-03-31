"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import LawForm from "@/components/laws/LawForm";
import LawEditForm from "@/components/laws/LawEditForm";
import LawTable, { Law as LawType } from "@/components/laws/LawTable";
import LawFilters from "@/components/laws/LawFilters";
import { pickTranslation } from "@/lib/pickTranslation";


type LawTranslation = {
  id: string;
  language: string;
  title: string;
  description?: string;
  pdfUrl?: string;
};

type Law = {
  id: string;
  category?: string;
  date?: string;
  translations: LawTranslation[];
};

export default function LawsPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLaw, setSelectedLaw] = useState<LawType | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingLaw, setEditingLaw] = useState<LawType | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const locale = useLocale();

  async function load() {
    if (status === "loading" || !session?.accessToken) return;
    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const res = await fetch(`${BACKEND_URL}/api/laws`, {
        headers: {
          "Authorization": `Bearer ${session.accessToken}`
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      setLaws((data.items || []).map((it: any) => ({ id: it.id, category: it.category, date: it.date, translations: it.translations || [] })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [session, status]);

  function handleCreated() {
    setCreateOpen(false);
    setEditingLaw(null);
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
    if (status === "loading" || !session?.accessToken) return;
    try
    {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const res = await fetch(`${BACKEND_URL}/api/laws/${id}`, {
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
  }

  const currentLocale = locale || "en";
  const selectedTranslation = selectedLaw
    ? pickTranslation(selectedLaw.translations, currentLocale, `Law #${selectedLaw.id}`)
    : null;

  const categoryOptions = useMemo(() => ([
    { value: "all", label: t("LawsPage.filters.all") },
    { value: "Civil Law", label: t("LawForm.categories.civilLaw") },
    { value: "Criminal Law", label: t("LawForm.categories.criminalLaw") },
    { value: "Administrative Law", label: t("LawForm.categories.administrativeLaw") },
    { value: "Commercial Law", label: t("LawForm.categories.commercialLaw") },
    { value: "Constitutional Law", label: t("LawForm.categories.constitutionalLaw") },
  ]), [t]);

  const filteredLaws = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return laws.filter((law) => {
      if (categoryFilter !== "all" && law.category !== categoryFilter) return false;
      if (!normalizedQuery) return true;

      const tr = pickTranslation(law.translations, currentLocale, "");
      const haystack = [
        tr.title,
        tr.description ?? "",
        law.category ?? "",
      ].join(" ").toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [laws, categoryFilter, query, currentLocale]);

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
              onSearch={setQuery}
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
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
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <LawTable
                loading={loading}
                laws={filteredLaws}
                query={query}
                locale={currentLocale}
                onOpen={(l) => { setSelectedLaw(l); setViewOpen(true); }}
                onEdit={(l) => { setEditingLaw(l); setCreateOpen(true); }}
                onDelete={handleDelete}
                onCreate={handleOpenCreate}
                createLabel={t("LawsPage.create") || "New Law"}
                showInlineCreate={false}
              />
            </div>
            
          )}
        </div>
      </ComponentCard>

      <Modal isOpen={createOpen} onClose={handleCloseCreate} className="max-w-3xl p-4">
        <h3 className="text-lg font-semibold mb-3">
          {editingLaw ? (t("LawsPage.edit") || "Edit Law") : (t("LawsPage.create") || "Create Law")}
        </h3>
        {editingLaw ? (
          <LawEditForm initialLaw={editingLaw} onSaved={handleCreated} onClose={handleCloseCreate} />
        ) : (
          <LawForm onSaved={handleCreated} onClose={handleCloseCreate} />
        )}
      </Modal>

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} className="max-w-md p-6">
        {selectedLaw && selectedTranslation && (
          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedTranslation.title}</h3>
            <p className="text-sm text-gray-600">{selectedLaw.category} • {selectedLaw.date}</p>
            <div className="mt-3 space-y-2">
              {selectedLaw.translations.map((tr) => (
                <div key={tr.language} className="p-2 border rounded">
                  <div className="font-medium">{tr.language.toUpperCase()} — {tr.title}</div>
                  {tr.description && <div className="text-sm text-gray-600">{tr.description}</div>}
                  {tr.pdfUrl ? <a className="text-sm text-blue-600" href={tr.pdfUrl} target="_blank" rel="noreferrer">{t("LawsPage.viewPdf") || "View PDF"}</a> : <div className="text-sm text-gray-400">No PDF</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
