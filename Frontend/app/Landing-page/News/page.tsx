"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/app/components/Home/Footer";
import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import NewsCard from "@/app/components/New/NewsCard";
import Pagination from "@/app/components/Pagination";
import VideoSection from "@/app/components/New/VideoSection";
import ResourceControlBar from "@/app/components/Resource/ResourceControlBar";
import EmptyState from "@/app/components/Resource/EmptyState";
import HeroCover from "@/app/components/HeroCover";
import ListSkeleton from "@/app/components/ListSkeleton";
import { compareText } from "@/app/lib/searchUtils";
import { NewsArticle, Video, PaginatedResponse } from "@/types/api";

// Using types from @/types/api

const newsPerPage = 9;
const videosPerPage = 3;
const backendUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";

const getFullImageUrl = (url: string | null | undefined) => {
  if (!url) return "/images/placeholder.svg";
  
  let finalUrl = url;
  if (finalUrl.startsWith("http://backend:5001")) {
    finalUrl = finalUrl.replace("http://backend:5001", backendUrl);
  }

  if (finalUrl.startsWith("http://") || finalUrl.startsWith("https://") || finalUrl.startsWith("data:")) {
    return finalUrl;
  }
  if (finalUrl.startsWith("/")) {
    return `${backendUrl}${finalUrl}`;
  }
  return `${backendUrl}/${url}`;
};

export default function News() {
  const t = useTranslations("NewsPage");
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();

  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const [currentVideoPage, setCurrentVideoPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Derive categories dynamically from articles
  const categoryLabels = React.useMemo(() => {
    const allCats = Array.from(
      new Set(
        newsArticles
          .map((a) => a.category)
          .filter(Boolean)
      )
    );
    return ["All", ...allCats];
  }, [newsArticles]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch news articles and videos from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const lang = locale === "kh" ? "km" : locale;

        // Fetch news articles
        const newsRes = await fetch(
          `${backendUrl}/api/public/news?lang=${lang}&page=1&pageSize=100`,
          { cache: "no-store" },
        );
        if (newsRes.ok) {
          const newsData: PaginatedResponse<NewsArticle> = await newsRes.json();
          setNewsArticles(newsData.items || newsData.data || []);
        }

        // Fetch videos
        const videosRes = await fetch(
          `${backendUrl}/api/public/videos?lang=${lang}&page=1&pageSize=100`,
          { cache: "no-store" },
        );
        if (videosRes.ok) {
          const videosData: PaginatedResponse<Video> = await videosRes.json();
          setVideos(videosData.items || videosData.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch news and videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  // Reset news pagination when search or category changes
  useEffect(() => {
    setCurrentNewsPage(1);
  }, [searchTerm, activeCategory]);

  const handleNewsPageChange = (page: number) => setCurrentNewsPage(page);
  const handleVideoPageChange = (page: number) => setCurrentVideoPage(page);

  // Sort articles (Always date_desc for News)
  const sortedArticles = [...newsArticles].sort((a, b) => {
    return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime();
  });

  // Filter by search term and category
  const filteredArticles = sortedArticles.filter((a) => {
    if (activeCategory !== "All" && a.category !== activeCategory) return false;
    if (!searchTerm) return true;
    const q = searchTerm.trim().toLowerCase();
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

  // Convert publishAt to date string for display
  const articlesForDisplay = paginatedArticles.map((article) => {
    const firstImgUrl = article.imageUrl ? article.imageUrl.split(",")[0].trim() : "";
    return {
      ...article,
      image: getFullImageUrl(firstImgUrl),
      date: article.publishAt?.split("T")[0] || "",
    };
  });

  if (!mounted || loading) {
    return (
      <>
        <Header />
        <Navigation />
        <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />
        <div className="min-h-screen bg-white">
          <div className="relative w-full">
            <HeroCover
              image="/news.svg"
              title={t("hero.title")}
              subtitle={t("hero.subtitle")}
            />
          </div>
          <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 md:px-10 py-12">
              <div className="max-w-6xl mx-auto">
                <ListSkeleton count={newsPerPage} />
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
        <div className="min-h-screen bg-gray-50/50 animate-fade-in-up [animation-delay:0.9s] opacity-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-6xl mx-auto">
              {/* Toolbar */}
              <div className="mb-6">
                <ResourceControlBar
                  categories={categoryLabels}
                  selectedCategory={activeCategory}
                  searchQuery={searchTerm}
                  onCategoryChange={setActiveCategory}
                  onSearchChange={setSearchTerm}
                  searchPlaceholderKey="NewsPage.toolbar.searchPlaceholder"
                  categoryPrefixKey="NewsPage.categories."
                />
              </div>

              <div className="mb-4 sm:mb-6">
                <h2 className="font-bold text-primary text-lg sm:text-xl md:text-2xl">
                  {t("latestNews")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {articlesForDisplay.map((article, i) => (
                  <div
                    key={article.id}
                    className="animate-slide-right-fade opacity-0"
                    style={{ animationDelay: `${0.9 + i * 0.06}s` }}
                  >
                    <NewsCard {...article} />
                  </div>
                ))}
              </div>
              
              {/* No Results Found Message */}
              {articlesForDisplay.length === 0 && (
                <EmptyState
                  onClear={() => {
                    setSearchTerm("");
                    setActiveCategory("All");
                  }}
                />
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
            </div>
          </div>
          
          {/* Video Section Full Width Breakout */}
          <div className="bg-white border-t border-gray-100 mt-12 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <h3 className="font-bold text-primary text-2xl sm:text-3xl">
                    {t("aside.title")}
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
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
                  <div className="flex justify-center mt-10">
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
        </div>
      </div>
      <Footer />
    </>
  );
}
