"use client";
import React, { useState, useMemo, useEffect } from "react";
import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import Footer from "@/app/components/Home/Footer";
import Pagination from "@/app/components/Pagination";
import PublicationCard from "@/app/components/Publication/PublicationCard";
import ResourceControlBar from "@/app/components/Resource/ResourceControlBar";
import EmptyState from "@/app/components/Resource/EmptyState";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import HeroCover from "@/app/components/HeroCover";
import ListSkeleton from "@/app/components/ListSkeleton";
import { api } from "@/app/lib/api";

const PublicationDrawerWrapper = dynamic(
  () => import("@/app/components/Publication/PublicationDrawer"),
  {
    ssr: false,
  },
);

export default function Publication() {
  const t = useTranslations("PublicationPage");
  const locale = useLocale();
  const apiLang = locale === "kh" ? "km" : locale || "en";

  type PublicationItem = {
    id: string | number;
    title: string;
    description?: string;
    category?: string;
    date?: string;
    pdf?: string | File;
  };

  type PublicPublicationListItem = {
    id: string;
    category: string;
    publicationDate?: string;
    language: string;
    title: string;
    summary?: string;
    content?: string;
    attachmentUrl?: string;
  };

  type PublicPublicationListResponse = {
    total: number;
    page: number;
    pageSize: number;
    categories?: string[];
    items: PublicPublicationListItem[];
  };

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedPub, setSelectedPub] = useState<PublicationItem | null>(null);
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const categoryLabels = useMemo(() => {
    const inferred = categories.length
      ? categories
      : Array.from(
          new Set(
            publications
              .map((p) => p.category)
              .filter((category): category is string => Boolean(category)),
          ),
        );
    return ["All", ...inferred];
  }, [categories, publications]);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mounted, setMounted] = useState(false);
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

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

  const getCategoryLabel = (label: string) => {
    if (label === "All") return t("categoryLabels.All");
    if (label === "NSPC") return t("categoryLabels.NSPC");
    if (label === "Others") return t("categoryLabels.Others");
    return label;
  };

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

        const q = query.trim();
        if (q) params.set("q", q);
        if (activeTab !== "All") params.set("category", activeTab);

        const data = await api.get<PublicPublicationListResponse>(
          `/api/public/publications?${params.toString()}`,
          { public: true },
        );

        if (cancelled) return;

        const items = data.items || [];

        setPublications(
          items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.summary || item.content || "",
            category: item.category,
            date: formatDate(item.publicationDate),
            pdf: item.attachmentUrl,
          })),
        );

        setCategories(data.categories ?? []);
        setTotalCount(Number(data.total ?? items.length));
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Failed to load publications.");
        setPublications([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTab, apiLang, currentPage, mounted, pageSize, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const tabs = categoryLabels.map((label) => ({
    key: label,
    label,
  }));

  // Show minimum skeleton on initial mount, but keep HeroCover visible
  if (!mounted) {
    return (
      <>
        <Header />
        <Navigation />
        <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />
        <div className="min-h-screen bg-white">
          <div className="relative w-full">
            <HeroCover
              image="/publication.svg"
              title={t("hero.title")}
              subtitle={t("hero.subtitle")}
            />
          </div>
          <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="max-w-6xl mx-auto">
                <ListSkeleton count={pageSize} />
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
            image="/publication.svg"
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </div>

        <div className="min-h-screen bg-gray-50/50 animate-fade-in-up [animation-delay:0.9s] opacity-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <ResourceControlBar
                  categories={categoryLabels}
                  selectedCategory={activeTab}
                  searchQuery={query}
                  onCategoryChange={setActiveTab}
                  onSearchChange={setQuery}
                  searchPlaceholderKey="PublicationPage.control.searchPlaceholder"
                  categoryPrefixKey="PublicationPage.categoryLabels."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {loading ? (
                  <ListSkeleton count={pageSize} />
                ) : (
                  publications.map((p, i) => (
                    <div
                      key={p.id}
                      className="animate-slide-right-fade opacity-0"
                      style={{ animationDelay: `${0.9 + i * 0.06}s` }}
                    >
                      <PublicationCard
                        pub={p}
                        onOpen={(pub) => {
                          const pdfUrl =
                            typeof pub.pdf === "string" ? pub.pdf : undefined;
                          if (window.innerWidth < 640 && pdfUrl) {
                            window.open(
                              pdfUrl,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          } else {
                            setSelectedPub(pub);
                            setDrawerOpen(true);
                          }
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
              
              {!loading && !error && publications.length === 0 && (
                <EmptyState
                  onClear={() => {
                    setQuery("");
                    setActiveTab("All");
                  }}
                />
              )}
              {error && (
                <div className="text-center text-red-600 mt-8">
                  {error}
                </div>
              )}
              <div className="mt-6 mb-4 flex justify-center sm:justify-end animate-fade-in-up">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
              {selectedPub && (
                // lazy render the drawer component so bundle only loads when used
                <React.Suspense fallback={null}>
                  {/* dynamic import to avoid SSR issues */}
                  <PublicationDrawerWrapper
                    pub={selectedPub}
                    open={drawerOpen}
                    onClose={() => {
                      setDrawerOpen(false);
                      setSelectedPub(null);
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
