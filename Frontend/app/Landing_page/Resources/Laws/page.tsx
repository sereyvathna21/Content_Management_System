"use client";

import React, { useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import LawCard from "@/app/components/LawCard";
import LawControlBar from "@/app/components/LawControlBar";
import PDFPreview from "@/app/components/PDFPreview";
import PDFPreviewEmpty from "@/app/components/PDFPreviewEmpty";
import MobilePDFModal from "@/app/components/MobilePDFModal";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PDFDocument } from "pdf-lib";

type LawItem = {
  id: string;
  title: string;
  category: string;
  url: string; // pdf url
  uploadDate?: string; // ISO date string or display
};

const SAMPLE_LAWS: LawItem[] = [
  {
    id: "1",
    title: "National Health Act",
    category: "Act",
    url: "/pdfs/health-act-2020.pdf",
    uploadDate: "2020-05-10",
  },
  {
    id: "2",
    title: "Environmental Regulations",
    category: "Regulation",
    url: "/pdfs/environment-2019.pdf",
    uploadDate: "2019-07-21",
  },
  {
    id: "3",
    title: "Education Policy Update",
    category: "Policy",
    url: "/pdfs/education-2021.pdf",
    uploadDate: "2021-03-15",
  },
  {
    id: "4",
    title: "Public Safety Notice",
    category: "Notification",
    url: "/pdfs/safety-2022.pdf",
    uploadDate: "2022-11-02",
  },
];

export default function Laws() {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(SAMPLE_LAWS.map((l) => l.category)))],
    [],
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPdf, setSelectedPdf] = useState<LawItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return SAMPLE_LAWS.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory)
        return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Laws & Regulations", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Records: ${filtered.length}`, 14, 34);
    if (selectedCategory !== "All") doc.text(`Category: ${selectedCategory}`, 14, 40);

    const exportItems = [...filtered].sort((a, b) => {
      const ta = a.uploadDate ? new Date(a.uploadDate).getTime() : 0;
      const tb = b.uploadDate ? new Date(b.uploadDate).getTime() : 0;
      return tb - ta;
    });

    const tableData = exportItems.map((law, index) => [
      index + 1,
      law.title,
      law.category,
      law.uploadDate ? new Date(law.uploadDate).toLocaleDateString() : "-",
      law.url,
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [["#", "Title", "Category", "Upload Date", "PDF Link"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 11, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    doc.save(`laws-regulations-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one PDF to export.");
      return;
    }

    try {
      const mergedPdf = await PDFDocument.create();

      const selectedLaws = selectedIds
        .map((id) => SAMPLE_LAWS.find((l) => l.id === id))
        .filter((l): l is LawItem => Boolean(l))
        .sort((a, b) => {
          const ta = a.uploadDate ? new Date(a.uploadDate).getTime() : 0;
          const tb = b.uploadDate ? new Date(b.uploadDate).getTime() : 0;
          return tb - ta;
        });

      for (const law of selectedLaws) {
        try {
          const res = await fetch(law.url);
          if (!res.ok) continue;
          const arrayBuffer = await res.arrayBuffer();
          const donorPdf = await PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
          copiedPages.forEach((p) => mergedPdf.addPage(p));
        } catch (e) {
          console.error(`Error loading PDF ${law.url}:`, e);
        }
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laws-merged-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to merge PDFs. Check console for details.");
    }
  };

  return (
    <>
      <Header />
      <Navigation />

      <div aria-hidden className="h-24 sm:h-32 md:h-36 lg:h-36" />
      <div >
      {/* Hero Section */}
      <div className="relative w-full animate-fade-in overflow-hidden">
        <img src="/hero1.svg" alt="Laws cover" className="absolute inset-0 w-full h-[13rem] sm:h-[14rem] md:h-[18.8rem] lg:h-[21.2rem] object-cover pointer-events-none transition-transform duration-700 ease-out" />
        <div className="absolute w-full h-[13rem] sm:h-[14rem] md:h-[18.8rem] lg:h-[21.3rem] bg-black/50 animate-fade-in" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="text-center">
            <h1 className="font-extrabold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight animate-slide-up-fade [animation-delay:0.3s] opacity-0">
              Laws and Regulations
            </h1>
            <p className="text-white/90 max-w-2xl mx-auto mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg animate-slide-up-fade [animation-delay:0.6s] opacity-0">
              Access and download official legal documents and policies.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50/50 animate-fade-in-up [animation-delay:0.9s] opacity-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          <div className="animate-slide-down-fade [animation-delay:1.1s] opacity-0">
            <LawControlBar 
            categories={categories}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            selectedCount={selectedIds.length}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onExportList={handleExportPDF}
            onExportSelected={handleExportSelected}
          />
          </div>
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up [animation-delay:1.3s] opacity-0">
            {/* List */}
            <div className="sm:col-span-1">
              <div className="space-y-3">
                {filtered.map((law, index) => (
                  <div
                    key={law.id}
                    className="animate-slide-right-fade opacity-0"
                    style={{ animationDelay: `${1.5 + index * 0.1}s` }}
                  >
                    <LawCard
                      id={law.id}
                      title={law.title}
                      category={law.category}
                      uploadDate={law.uploadDate}
                      isSelected={selectedPdf?.id === law.id}
                      isChecked={selectedIds.includes(law.id)}
                      onSelect={() => setSelectedPdf(law)}
                      onToggleCheck={() => handleToggleSelect(law.id)}
                    />
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300 animate-bounce-in opacity-0 [animation-delay:1.8s]">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No documents found matching your criteria.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview - hidden on xs (mobile) because mobile uses modal */}
            <div className="hidden sm:block sm:col-span-2 animate-slide-left-fade [animation-delay:1.6s] opacity-0">
              <div className="transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
                {selectedPdf ? (
                  <PDFPreview title={selectedPdf.title} url={selectedPdf.url} onClose={() => setSelectedPdf(null)} />
                ) : (
                  <PDFPreviewEmpty />
                )}
              </div>
            </div>
          </div>

          {/* Mobile preview modal */}
          {selectedPdf && (
            <div className="animate-fade-in-scale">
              <MobilePDFModal title={selectedPdf.title} url={selectedPdf.url} onClose={() => setSelectedPdf(null)} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}