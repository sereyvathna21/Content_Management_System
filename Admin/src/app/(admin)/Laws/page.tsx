"use client";
import React, { useEffect, useRef, useState } from "react";
import { useLaws, Law, LawCreateInput, LawUpdateInput } from "../../../hooks/useLaws";
import ComponentCard from "../../../components/common/ComponentCard";
import Pagination from "../../../components/tables/Pagination";
import { useTranslations } from "next-intl";

const CATEGORIES = [
  "Royal Degree",
  "Sub-Degree",
  "Prakas",
  "Decision and Guideline",
];

// ── Inline form (create / edit) ──────────────────────────────────────────────

function LawForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial?: Law | null;
  saving: boolean;
  onSave: (data: LawUpdateInput, pdfEnFile?: File, pdfKhFile?: File) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("LawPage");
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? "");
  const [titleKh, setTitleKh] = useState(initial?.titleKh ?? "");
  const [descEn, setDescEn] = useState(initial?.descriptionEn ?? "");
  const [descKh, setDescKh] = useState(initial?.descriptionKh ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [date, setDate] = useState(initial?.date ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [pdfEnFile, setPdfEnFile] = useState<File | undefined>(undefined);
  const [pdfKhFile, setPdfKhFile] = useState<File | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const pdfEnRef = useRef<HTMLInputElement>(null);
  const pdfKhRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() && !titleKh.trim()) {
      setError(t("validation.titleRequired"));
      return;
    }
    if (!category) {
      setError(t("validation.categoryRequired"));
      return;
    }
    setError(null);
    onSave(
      {
        titleEn: titleEn.trim(),
        titleKh: titleKh.trim(),
        descriptionEn: descEn.trim() || undefined,
        descriptionKh: descKh.trim() || undefined,
        category,
        date: date || undefined,
        isPublished,
        pdfEn: initial?.pdfEn,
        pdfKh: initial?.pdfKh,
      },
      pdfEnFile,
      pdfKhFile
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Titles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.titleEn")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("placeholders.titleEn")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.titleKh")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titleKh}
            onChange={(e) => setTitleKh(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("placeholders.titleKh")}
          />
        </div>
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.descriptionEn")}
          </label>
          <textarea
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t("placeholders.descriptionEn")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.descriptionKh")}
          </label>
          <textarea
            value={descKh}
            onChange={(e) => setDescKh(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t("placeholders.descriptionKh")}
          />
        </div>
      </div>

      {/* Category & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.category")} <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.date")}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* PDF Uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.pdfEn")}
          </label>
          {initial?.pdfEn && (
            <p className="text-xs text-green-600 mb-1">
              ✓ {t("currentPdf")}: {initial.pdfEn.split("/").pop()}
            </p>
          )}
          <input
            ref={pdfEnRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfEnFile(e.target.files?.[0])}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.pdfKh")}
          </label>
          {initial?.pdfKh && (
            <p className="text-xs text-green-600 mb-1">
              ✓ {t("currentPdf")}: {initial.pdfKh.split("/").pop()}
            </p>
          )}
          <input
            ref={pdfKhRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfKhFile(e.target.files?.[0])}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <input
          id="isPublished"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
          {t("fields.isPublished")}
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          {t("actions.cancel")}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {saving ? t("actions.saving") : t("actions.save")}
        </button>
      </div>
    </form>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function LawsPage() {
  const t = useTranslations("LawPage");
  const {
    laws,
    loading,
    saving,
    loadLaws,
    createLaw,
    updateLaw,
    removeLaw,
    uploadPdf,
    filterLaws,
    query,
    clearFilters,
    page,
    totalPages,
    totalCount,
    setPage,
    all,
  } = useLaws();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Law | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadLaws().catch(() => {});
  }, []);

  const handleSave = async (data: LawUpdateInput, pdfEnFile?: File, pdfKhFile?: File) => {
    setFormError(null);
    try {
      let lawId: string;
      if (editTarget) {
        const updated = await updateLaw(editTarget.id, data);
        lawId = updated.id;
      } else {
        const created = await createLaw(data as LawCreateInput);
        lawId = created.id;
      }

      // Upload PDFs if provided
      if (pdfEnFile) await uploadPdf(lawId, "en", pdfEnFile);
      if (pdfKhFile) await uploadPdf(lawId, "kh", pdfKhFile);

      setShowForm(false);
      setEditTarget(null);
    } catch (e: any) {
      setFormError(e?.message || t("errors.saveFailed"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeLaw(id);
      setConfirmDeleteId(null);
    } catch {
      // error handled silently
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (law: Law) => {
    setEditTarget(law);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setFormError(null);
  };

  // Compute unique categories from loaded data for filter display
  const categories = Array.from(new Set(all.map((l) => l.category))).sort();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl text-primary font-semibold">{t("title")}</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span>+</span> {t("actions.create")}
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="mb-6">
          <ComponentCard
            title={editTarget ? t("editTitle") : t("createTitle")}
            desc={editTarget ? t("editDesc") : t("createDesc")}
          >
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <LawForm
              initial={editTarget}
              saving={saving}
              onSave={handleSave}
              onCancel={closeForm}
            />
          </ComponentCard>
        </div>
      )}

      {/* Laws table */}
      <ComponentCard
        title={`${t("listTitle")} (${totalCount})`}
        desc={t("listDesc")}
      >
        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => filterLaws(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {query && (
              <button
                onClick={() => clearFilters()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">{t("loading")}</div>
        ) : laws.length === 0 ? (
          <div className="py-12 text-center text-gray-500">{t("noResults")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("columns.title")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("columns.category")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("columns.date")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("columns.pdfs")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("columns.status")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("columns.actions")}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {laws.map((law, idx) => (
                  <tr key={law.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 max-w-xs">
                        <div>{law.titleEn || "—"}</div>
                        <div className="text-gray-500">{law.titleKh || "—"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
                        {law.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{law.date || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {law.pdfEn && (
                          <span className="inline-block px-1.5 py-0.5 text-xs rounded bg-green-50 text-green-700 font-medium">EN</span>
                        )}
                        {law.pdfKh && (
                          <span className="inline-block px-1.5 py-0.5 text-xs rounded bg-purple-50 text-purple-700 font-medium">KH</span>
                        )}
                        {!law.pdfEn && !law.pdfKh && (
                          <span className="text-xs text-gray-400">{t("noPdf")}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                        law.isPublished
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {law.isPublished ? t("published") : t("draft")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(law)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          {t("actions.edit")}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(law.id)}
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          {t("actions.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </ComponentCard>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("confirmDeleteTitle")}</h3>
            <p className="text-sm text-gray-600 mb-6">{t("confirmDeleteText")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                {t("actions.cancel")}
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
              >
                {t("actions.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
