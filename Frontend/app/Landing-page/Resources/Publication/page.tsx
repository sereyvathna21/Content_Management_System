"use client";
import React, { useState, useMemo, useEffect } from "react";
import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import Pagination from "@/app/components/Pagination";
import PublicationCard from "@/app/components/PublicationCard";
import dynamic from "next/dynamic";

const PDFDrawerWrapper = dynamic(() => import("@/app/components/PDFDrawer"), {
  ssr: false,
});

export default function Publication() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedPub, setSelectedPub] = useState<any | null>(null);
  const publications = [
    {
      id: 1,
      title: "Publication Title 1",
      description:
        "A brief description of the publication goes here. It provides an overview of the content and key findings.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/test.pdf",
    },
    {
      id: 2,
      title: "Publication Title 2",
      description: "Summary of the second publication.",
      category: "Others",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
    {
      id: 3,
      title: "Publication Title 3",
      description: "Summary of the third publication.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
    {
      id: 4,
      title: "Publication Title 4",
      description: "Summary of the fourth publication.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
    {
      id: 5,
      title: "Publication Title 1",
      description:
        "A brief description of the publication goes here. It provides an overview of the content and key findings.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/test.pdf",
    },
    {
      id: 6,
      title: "Publication Title 2",
      description: "Summary of the second publication.",
      category: "Others",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
    {
      id: 7,
      title: "Publication Title 3",
      description: "Summary of the third publication.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
    {
      id: 8,
      title: "Publication Title 4",
      description: "Summary of the fourth publication.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
    {
      id: 9,
      title: "Publication Title 1",
      description:
        "A brief description of the publication goes here. It provides an overview of the content and key findings.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/test.pdf",
    },
    {
      id: 10,
      title: "Publication Title 2",
      description: "Summary of the second publication.",
      category: "Others",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
    {
      id: 11,
      title: "Publication Title 3",
      description: "Summary of the third publication.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
    {
      id: 12,
      title: "Publication Title 4",
      description: "Summary of the fourth publication.",
      category: "NSPC",
      date: "2023-05-01",
      pdf: "/laws/sample.pdf",
    },
  ];

  const tabLabels = ["All", "NSPC", "Others"];
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const tabs = tabLabels.map((label) => ({
    key: label.toLowerCase(),
    label,
  }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications.filter((p) => {
      if (activeTab !== "all" && p.category.toLowerCase() !== activeTab)
        return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [publications, query, activeTab]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    // reset to first page when filters change
    setCurrentPage(1);
  }, [query, activeTab]);

  // clamp currentPage if filtered length shrinks
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // PublicationCard moved to app/components/PublicationCard.tsx

  return (
    <>
      <Header />
      <Navigation />
      <div className="min-h-screen bg-white pt-24 sm:pt-32 md:pt-36 lg:pt-44">
        {/* Header Section */}
        <div className="bg-primary py-6 sm:py-8 md:py-10 lg:py-12 animate-fade-in">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="fluid-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-2 sm:mb-2 md:mb-3 animate-slide-down text-white">
              Publications
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-center text-white/90 max-w-2xl mx-auto animate-slide-up">
              Stay updated with the latest news, resources, and publications
              from NSPC.
            </p>
          </div>
        </div>

        <div className="min-h-screen bg-gray-50/50 animate-fade-in-up [animation-delay:0.9s] opacity-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1 w-full sm:w-auto">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 sm:hidden">
                        Filter by Category
                      </h3>

                      <div className="hidden sm:flex items-center gap-2 flex-wrap">
                        {tabs.map((t) => {
                          const active = t.key === activeTab;
                          return (
                            <button
                              key={t.key}
                              onClick={() => setActiveTab(t.key)}
                              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 transform ${
                                active
                                  ? "bg-primary text-white border-primary shadow-lg scale-105"
                                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:scale-105"
                              }`}
                            >
                              {t.label}
                              {active && (
                                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-white/20 rounded-full">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="block sm:hidden">
                        <div className="relative">
                          <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 appearance-none cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                          >
                            {tabs.map((t) => (
                              <option key={t.key} value={t.key}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:flex-shrink-0">
                      <div className="relative flex-1 sm:flex-initial sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search publications..."
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-primary rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                        />
                        {query && (
                          <button
                            onClick={() => setQuery("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {pageItems.map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-slide-right-fade opacity-0"
                    style={{ animationDelay: `${0.9 + i * 0.06}s` }}
                  >
                    <PublicationCard
                      pub={p}
                      onOpen={(pub) => {
                        setSelectedPub(pub);
                        setDrawerOpen(true);
                      }}
                    />
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center text-gray-500">
                    No publications found.
                  </div>
                )}
              </div>
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
                  <PDFDrawerWrapper
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
