"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useMessages } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import NewsCard from "@/app/components/NewsCard";
import Pagination from "@/app/components/Pagination";
import VideoSection from "@/app/components/VideoSection";
import SortControl from "@/app/components/SortControl";
import SearchBar from "@/app/components/SearchBar";
import HeroCover from "@/app/components/HeroCover";
import ListSkeleton from "@/app/components/ListSkeleton";
import { newsArticles } from "@/app/Landing-page/News/articles";
import { matchesSearch, compareText } from "@/app/lib/searchUtils";
import { videos } from "@/app/Landing-page/News/videos";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

const newsPerPage = 9; // Limit for news articles
const videosPerPage = 3; // Limit for videos

export default function News() {
  const t = useTranslations("NewsPage");
  const messages = useMessages();
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

  // Reset news pagination when search or sort changes
  useEffect(() => {
    setCurrentNewsPage(1);
  }, [searchTerm, sortOption]);

  const handleSortChange = (v: string) => {
    setSortOption(v);
    if (mounted) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (v) params.set("sort", v);
      else params.delete("sort");
      const qs = params.toString();
      router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }
  };

  const handleNewsPageChange = (page: number) => setCurrentNewsPage(page);
  const handleVideoPageChange = (page: number) => setCurrentVideoPage(page);

  // support combined sort+direction values like 'date_desc' or 'title_asc'
  const effectiveSort = sortOption || "date_desc";
  const [sortKey, sortDir] = effectiveSort.split("_");

  // Safe typed traversal of the next-intl message bundle for the current locale.
  // Uses useMessages() instead of double-importing JSON files.
  const safeGet = (
    obj: Record<string, unknown>,
    path: string,
  ): string | undefined => {
    const parts = path.split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (
        cur !== null &&
        typeof cur === "object" &&
        p in (cur as Record<string, unknown>)
      ) {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        return undefined;
      }
    }
    return typeof cur === "string" && cur.length > 0 ? cur : undefined;
  };

  const bundle =
    ((messages as Record<string, unknown>).NewsPage as Record<
      string,
      unknown
    >) ?? {};

  const getArticleTitle = (a: NewsArticle): string =>
    safeGet(bundle, `content.articles.${a.id}.title`) ?? a.title;

  const getArticleExcerpt = (a: NewsArticle): string =>
    safeGet(bundle, `content.articles.${a.id}.excerpt`) ?? a.excerpt;

  const getArticleCategory = (a: NewsArticle): string =>
    safeGet(bundle, `categories.${a.category.toLowerCase()}`) ?? a.category;

  const sortedArticles = [...newsArticles].sort((a, b) => {
    if (sortKey === "date") {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? diff : -diff;
    } else if (sortKey === "title") {
      const cmp = compareText(getArticleTitle(a), getArticleTitle(b));
      return sortDir === "asc" ? cmp : -cmp;
    } else if (sortKey === "category") {
      const cmp = compareText(getArticleCategory(a), getArticleCategory(b));
      return sortDir === "asc" ? cmp : -cmp;
    }
    return 0;
  });
  // filter by search term (title, excerpt, category)
  const filteredArticles = sortedArticles.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.trim();
    return (
      matchesSearch(getArticleTitle(a), q) ||
      matchesSearch(getArticleExcerpt(a), q) ||
      matchesSearch(getArticleCategory(a), q)
    );
  });

  const totalNewsPages = Math.ceil(filteredArticles.length / newsPerPage);
  const totalVideoPages = Math.ceil(videos.length / videosPerPage);

  const paginatedArticles = filteredArticles.slice(
    (currentNewsPage - 1) * newsPerPage,
    currentNewsPage * newsPerPage,
  );

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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 md:px-10">
            {/* Toolbar skeleton */}
            <div className="flex flex-col sm:flex-row items-end justify-between gap-6 sm:gap-4 mb-6 sm:mb-8 mt-6">
              <div
                className="w-40 h-9 bg-gray-100 rounded-lg animate-pulse"
                style={{ animationDuration: "1.5s" }}
              />
              <div
                className="w-64 h-9 bg-gray-100 rounded-lg animate-pulse"
                style={{ animationDuration: "1.5s", animationDelay: "75ms" }}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              <main className="lg:col-span-8 lg:col-start-3">
                <ListSkeleton count={9} />
                <div
                  className="mt-10 bg-gray-100 rounded-2xl h-64 animate-pulse"
                  style={{ animationDuration: "1.5s", animationDelay: "150ms" }}
                />
              </main>
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
      <div className="min-h-screen bg-white">
        <div className="relative w-full animate-fade-in overflow-hidden">
          <HeroCover
            image="/news.svg"
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 md:px-10">
          {/* Toolbar: sort + info */}
          <div className="flex flex-col sm:flex-row items-end justify-between gap-6 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-full sm:w-auto">
              <SortControl value={sortOption} onChange={handleSortChange} />
            </div>
            <div className="w-full sm:w-auto">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t("toolbar.searchPlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <main className="lg:col-span-8 lg:col-start-3">
              <h2 className="font-bold text-primary text-lg sm:text-xl md:text-2xl mb-4 sm:mb-5 md:mb-6">
                {t("latestNews")}
              </h2>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full max-w-6xl">
                  {paginatedArticles.map((article) => (
                    <NewsCard key={article.id} {...article} />
                  ))}
                </div>
              </div>
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

              {/* News Pagination Controls */}
              {totalNewsPages > 1 && (
                <div className="flex justify-center mt-10 sm:mt-12">
                  <Pagination
                    currentPage={currentNewsPage}
                    totalPages={totalNewsPages}
                    onPageChange={handleNewsPageChange}
                  />
                </div>
              )}

              {/* Video Section */}
              <div className="mt-10 flex justify-center">
                <div className="w-full max-w-5xl">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-primary text-lg sm:text-xl">
                        {t("aside.title")}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base mt-2">
                        {t("aside.description")}
                      </p>
                    </div>

                    <VideoSection
                      videos={videos}
                      videosPerPage={videosPerPage}
                      currentPage={currentVideoPage}
                    />

                    {/* Video Pagination Controls */}
                    {totalVideoPages > 1 && (
                      <div className="flex justify-center mt-5">
                        <Pagination
                          currentPage={currentVideoPage}
                          totalPages={totalVideoPages}
                          onPageChange={handleVideoPageChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
