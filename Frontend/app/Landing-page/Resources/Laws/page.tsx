"use client";

import React, { useMemo, useState, useEffect } from "react";
import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import Footer from "@/app/components/Home/Footer";
import LawCard from "@/app/components/Law/LawCard";
import LawControlBar from "@/app/components/Law/LawControlBar";
import HeroCover from "@/app/components/HeroCover";
import Pagination from "@/app/components/Pagination";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import ListSkeleton from "@/app/components/ListSkeleton";
import { api, PublicLawListResponse } from "@/app/lib/api";

const LawDrawerWrapper = dynamic(
  () => import("@/app/components/Law/LawDrawer"),
  {
    ssr: false,
  },
);

type LawItem = {
  id: string;
  title: string;
  description?: string;
  category: string;
  date?: string;
  pdf?: string;
};

export default function Laws() {
  const t = useTranslations("LawsPage");
  const locale = useLocale();
  const apiLang = locale === "kh" ? "km" : locale || "en";
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedLaw, setSelectedLaw] = useState<LawItem | null>(null);
  const [laws, setLaws] = useState<LawItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const categoryLabels = useMemo(() => {
    const inferred = categories.length
      ? categories
      : Array.from(new Set(laws.map((l) => l.category)));
    return ["All", ...inferred];
  }, [categories, laws]);

  const noop = () => {};

  const formatDate = (value?: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
      .format(parsed)
      .replace(/\//g, "-");
  };

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mounted, setMounted] = useState(false);
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          lang: apiLang,
          page: String(currentPage),
          pageSize: String(pageSize),
        });
        const q = (searchQuery || "").trim();
        if (q) params.set("q", q);
        if (activeCategory !== "All") params.set("category", activeCategory);

        const data = await api.get<PublicLawListResponse>(
          `/api/public/laws?${params.toString()}`,
          { public: true },
        );
        if (cancelled) return;

        const items = data.items || [];
        setLaws(
          items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            date: formatDate(item.date),
            pdf: item.pdfUrl,
          })),
        );
        setCategories(data.categories ?? []);
        setTotalCount(Number(data.total ?? items.length));
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Failed to load laws.");
        setLaws([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, apiLang, currentPage, mounted, pageSize, searchQuery]);

  useEffect(() => {
    // reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  // clamp currentPage if total pages shrink
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Show loading skeleton while mounting
  if (!mounted) {
    return (
      <>
        <Header />
        <Navigation />
        <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />
        <div className="min-h-screen bg-white">
          <div className="relative w-full">
            <div
              className="w-full h-64 bg-gray-100 animate-pulse"
              style={{ animationDuration: "1.5s" }}
            />
          </div>
          <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="max-w-6xl mx-auto">
                <ListSkeleton count={9} />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Navigation />

      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />

      <div className="min-h-screen bg-white">
        <div className="relative w-full animate-fade-in overflow-hidden">
          <HeroCover
            image="/hero1.svg"
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </div>

        <div className="min-h-screen bg-gray-50/50 animate-fade-in-up [animation-delay:0.9s] opacity-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-6xl mx-auto">
              {/* Control Bar */}
              <div className="mb-6">
                <LawControlBar
                  categories={categoryLabels}
                  selectedCategory={activeCategory}
                  searchQuery={searchQuery}
                  selectedCount={0}
                  onCategoryChange={setActiveCategory}
                  onSearchChange={setSearchQuery}
                  onExportList={noop}
                  onExportSelected={noop}
                />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {loading ? (
                  <ListSkeleton count={pageSize} />
                ) : (
                  laws.map((law, i) => (
                    <div
                      key={law.id}
                      className="animate-slide-right-fade opacity-0"
                      style={{ animationDelay: `${0.9 + i * 0.06}s` }}
                    >
                      <LawCard
                        id={law.id}
                        title={law.title}
                        description={law.description}
                        category={law.category}
                        date={law.date}
                        pdf={law.pdf}
                        onOpen={() => {
                          if (window.innerWidth < 640 && law.pdf) {
                            window.open(
                              law.pdf,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          } else {
                            setSelectedLaw(law);
                            setDrawerOpen(true);
                          }
                        }}
                      />
                    </div>
                  ))
                )}
                {!loading && !error && laws.length === 0 && (
                  <div className="col-span-full text-center text-gray-500">
                    {t("noResults")}
                  </div>
                )}
                {error && (
                  <div className="col-span-full text-center text-red-600">
                    {error}
                  </div>
                )}
              </div>
              {/* Pagination */}
              <div className="mt-6 mb-4 flex justify-center sm:justify-end animate-fade-in-up">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
              {selectedLaw && (
                <React.Suspense fallback={null}>
                  <LawDrawerWrapper
                    law={selectedLaw}
                    open={drawerOpen}
                    onClose={() => {
                      setDrawerOpen(false);
                      setSelectedLaw(null);
                    }}
                  />
                </React.Suspense>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
