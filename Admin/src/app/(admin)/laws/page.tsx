"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import LawForm from "@/components/laws/LawForm";

type LawTranslation = {
  id: number;
  language: string;
  title: string;
  description?: string;
  pdfUrl?: string;
};

type Law = {
  id: number;
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
    load();
  }

  const currentLocale = typeof window !== "undefined" ? (navigator.language || "en").split("-")[0] : "en";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl text-primary font-semibold mb-4">{t("LawsPage.title") || "Laws"}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)} className="h-9 px-4">{t("LawsPage.create") || "New Law"}</Button>
        </div>
      </div>

      <ComponentCard title={t("LawsPage.card.title") || "Laws"} desc={t("LawsPage.card.desc") || "Manage laws and translations"}>
        <div className="mt-2">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {laws.map((l) => {
                const tr = l.translations.find((x) => x.language === currentLocale) ?? l.translations[0];
                return (
                  <div key={l.id} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{tr?.title ?? `Law #${l.id}`}</div>
                      <div className="text-sm text-gray-500">{l.category} • {l.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tr?.pdfUrl ? <a className="text-sm text-blue-600" href={tr.pdfUrl} target="_blank" rel="noreferrer">{t("LawsPage.viewPdf") || "View PDF"}</a> : <span className="text-sm text-gray-400">No PDF</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ComponentCard>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} className="max-w-3xl p-4">
        <h3 className="text-lg font-semibold mb-3">{t("LawsPage.create") || "Create Law"}</h3>
        <LawForm onSaved={handleCreated} />
      </Modal>
    </div>
  );
}
