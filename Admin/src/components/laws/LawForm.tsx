"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useTranslations } from "next-intl";
import type { Law, CreateLawPayload } from "@/hooks/useLaws";

const CATEGORIES = [
  "Royal Decree",
  "Sub-Degree",
  "Prakas",
  "Decision and Guideline",
];

type LawFormProps = {
  open: boolean;
  initial?: Law | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: CreateLawPayload) => void;
};

const emptyForm = (): CreateLawPayload => ({
  title: "",
  description: "",
  category: CATEGORIES[0],
  date: "",
  pdfUrl: "",
  pdfUrlKh: "",
});

export default function LawForm({ open, initial, saving, onClose, onSave }: LawFormProps) {
  const t = useTranslations("LawsPage");
  const [form, setForm] = useState<CreateLawPayload>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof CreateLawPayload, string>>>({});

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          title: initial.title,
          description: initial.description ?? "",
          category: initial.category,
          date: initial.date ? initial.date.split("T")[0] : "",
          pdfUrl: initial.pdfUrl,
          pdfUrlKh: initial.pdfUrlKh ?? "",
        });
      } else {
        setForm(emptyForm());
      }
      setErrors({});
    }
  }, [open, initial]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof CreateLawPayload, string>> = {};
    if (!form.title.trim()) e.title = t("form.titleRequired");
    if (!form.category.trim()) e.category = t("form.categoryRequired");
    if (!form.pdfUrl.trim()) e.pdfUrl = t("form.pdfUrlRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      category: form.category,
      date: form.date || undefined,
      pdfUrl: form.pdfUrl.trim(),
      pdfUrlKh: form.pdfUrlKh?.trim() || undefined,
    });
  };

  const field = (
    key: keyof CreateLawPayload,
    labelKey: string,
    placeholder: string,
    type: string = "text"
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t(labelKey)}
        {(key === "title" || key === "category" || key === "pdfUrl") && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <input
        type={type}
        value={(form[key] as string) ?? ""}
        onChange={(e) => {
          setForm((prev) => ({ ...prev, [key]: e.target.value }));
          if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
        }}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
          errors[key] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-transparent"
        }`}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      className="max-w-lg p-6"
      backdropClassName="fixed inset-0 h-full w-full bg-gray-400/30 backdrop-blur-sm"
    >
      <h2 className="text-xl font-semibold text-primary mb-4">
        {initial ? t("form.editTitle") : t("form.createTitle")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {field("title", "form.titleLabel", t("form.titlePlaceholder"))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("form.descriptionLabel")}
          </label>
          <textarea
            value={form.description ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={t("form.descriptionPlaceholder")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("form.categoryLabel")} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {field("date", "form.dateLabel", "", "date")}

        <div className="border border-blue-100 rounded-lg p-4 bg-blue-50/50 space-y-4">
          <h3 className="text-sm font-semibold text-blue-800">{t("form.pdfSection")}</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("form.pdfUrlEnLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.pdfUrl}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, pdfUrl: e.target.value }));
                if (errors.pdfUrl) setErrors((prev) => ({ ...prev, pdfUrl: undefined }));
              }}
              placeholder={t("form.pdfUrlEnPlaceholder")}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                errors.pdfUrl ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-transparent"
              }`}
            />
            {errors.pdfUrl && (
              <p className="mt-1 text-xs text-red-500">{errors.pdfUrl}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{t("form.pdfUrlEnHint")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("form.pdfUrlKhLabel")}
            </label>
            <input
              type="text"
              value={form.pdfUrlKh ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, pdfUrlKh: e.target.value }))}
              placeholder={t("form.pdfUrlKhPlaceholder")}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">{t("form.pdfUrlKhHint")}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            {t("form.cancel")}
          </Button>
          <Button
            size="sm"
            type="submit"
            disabled={saving}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {saving ? t("form.saving") : t("form.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
