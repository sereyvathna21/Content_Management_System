"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import NewsCard from "@/app/components/NewsCard";
import Pagination from "@/app/components/Pagination";
import VideoSection from "@/app/components/VideoSection";
import SortControl from "@/app/components/SortControl";
import SearchBar from "@/app/components/SearchBar";
import HeroCover from "@/app/components/HeroCover";
interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}
import { newsArticles } from "@/app/Landing-page/News/articles";
import { videos } from "@/app/Landing-page/News/videos";

const newsPerPage = 12; // Limit for news articles
const videosPerPage = 3; // Limit for videos

export default function News() {
  const t = useTranslations("NewsPage");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const [currentVideoPage, setCurrentVideoPage] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  // Handle initial sort parameter after component mounts
  useEffect(() => {
    setMounted(true);
    const initialSort = searchParams?.get("sort") || "";
    setSortOption(initialSort);
  }, [searchParams]);

  const handleSortChange = (v: string) => {
    setSortOption(v);
    if (mounted) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (v) params.set("sort", v);
      else params.delete("sort");
      const qs = params.toString();
      // update URL without refreshing the page
      router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }
  };

  // support combined sort+direction values like 'date_desc' or 'title_asc'
  const effectiveSort = sortOption || "date_desc"; // treat Default as newest-first
  const [sortKey, sortDir] = effectiveSort.split("_");

  const sortedArticles = [...newsArticles].sort((a, b) => {
    if (sortKey === "date") {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? diff : -diff;
    } else if (sortKey === "title") {
      const cmp = a.title.localeCompare(b.title);
      return sortDir === "asc" ? cmp : -cmp;
    } else if (sortKey === "category") {
      const cmp = a.category.localeCompare(b.category);
      return sortDir === "asc" ? cmp : -cmp;
    }
    return 0;
  });
  // filter by search term (title, excerpt, category)
  const filteredArticles = sortedArticles.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  });

  const totalNewsPages = Math.ceil(filteredArticles.length / newsPerPage);
  const totalVideoPages = Math.ceil(videos.length / videosPerPage);

  const paginatedArticles = filteredArticles.slice(
    (currentNewsPage - 1) * newsPerPage,
    currentNewsPage * newsPerPage,
  );

  // reset news pagination when search or sort changes
  React.useEffect(() => {
    setCurrentNewsPage(1);
  }, [searchTerm, sortOption]);

  const paginatedVideos = videos.slice(
    (currentVideoPage - 1) * videosPerPage,
    currentVideoPage * videosPerPage,
  );

  const handleNewsPageChange = (page: number) => {
    setCurrentNewsPage(page);
  };

  const handleVideoPageChange = (page: number) => {
    setCurrentVideoPage(page);
  };

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <>
        <Header />
        <Navigation />
        <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />
        <div className="min-h-screen bg-white to-blue-50/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 md:px-10 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
      {/* spacer to offset fixed Navigation height so page header is visible */}

      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />
      <div className="min-h-screen bg-white to-blue-50/30">
        <div className="relative w-full animate-fade-in overflow-hidden">
          <HeroCover
            image="/news.svg"
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 md:px-10 ">
          {/* Toolbar: sort + info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <SortControl value={sortOption} onChange={handleSortChange} />
            </div>
            <div className="gap-3 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t("toolbar.searchPlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <main className="lg:col-span-8">
              <h2 className="font-bold text-primary text-lg sm:text-xl md:text-2xl mb-4 sm:mb-5 md:mb-6">
                {t("latestNews")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {paginatedArticles.map((article) => (
                  <NewsCard key={article.id} {...article} />
                ))}
              </div>

              {/* News Pagination Controls */}
              {totalNewsPages > 1 && (
                <div className="flex justify-end mt-10 sm:mt-12">
                  <Pagination
                    currentPage={currentNewsPage}
                    totalPages={totalNewsPages}
                    onPageChange={handleNewsPageChange}
                  />
                </div>
              )}

              {/* No Results Found Message */}
              {paginatedArticles.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-3">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {t("noResults.title")}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {t("noResults.subtitle")}
                  </p>
                </div>
              )}
            </main>

            <aside className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="w-full max-w-3xl lg:max-w-none">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <div className="text-center lg:text-left mb-4">
                    <h3 className="font-bold text-primary text-lg sm:text-xl">
                      {t("aside.title")}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mt-2 lg:mt-0">
                      {t("aside.description")}
                    </p>
                  </div>

                  <VideoSection
                    videos={videos}
                    videosPerPage={videosPerPage}
                    currentPage={currentVideoPage}
                  />

                  {totalVideoPages > 1 && (
                    <div className="flex justify-center mt-5">
                      <Link
                        href="/Landing-page/News/videos/1"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {t("seeMore")}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
