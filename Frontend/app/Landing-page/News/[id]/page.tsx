import React from "react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/app/components/Home/Header";
import Image from "next/image";

import Footer from "@/app/components/Home/Footer";
import Navigation from "@/app/components/Home/Navigation";
import Breadcrumbs from "@/app/components/New/Breadcrumbs";
import Link from "next/link";
import { NewsArticle, PaginatedResponse } from "@/types/api";
import ImageSlideshow from "@/app/components/ImageSlideshow";

const internalBackendUrl =
  process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const publicBackendUrl = 
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const getFullImageUrl = (url: string | null | undefined) => {
  if (!url) return "/images/placeholder.svg";
  
  let finalUrl = url;
  // If the backend API returned an absolute URL using the internal Docker hostname, rewrite it to the public one
  if (finalUrl.startsWith("http://backend:5001")) {
    finalUrl = finalUrl.replace("http://backend:5001", publicBackendUrl);
  }

  if (finalUrl.startsWith("http://") || finalUrl.startsWith("https://") || finalUrl.startsWith("data:")) {
    return finalUrl;
  }
  if (finalUrl.startsWith("/")) {
    return `${publicBackendUrl}${finalUrl}`;
  }
  return `${publicBackendUrl}/${finalUrl}`;
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("NewsPage");
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "kh";
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id);
  const lang = locale === "kh" ? "km" : locale;

  // Fetch article from public API
  let article: NewsArticle | null = null;
  try {
    const res = await fetch(
      `${internalBackendUrl}/api/public/news/${encodeURIComponent(id)}?lang=${lang}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      article = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch news article:", error);
  }

  if (!article) return notFound();

  // Fetch related articles
  let relatedArticles: NewsArticle[] = [];
  try {
    const res = await fetch(
      `${internalBackendUrl}/api/public/news?lang=${lang}&page=1&pageSize=6`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const newsData: PaginatedResponse<NewsArticle> = await res.json();
      const items = newsData.items || newsData.data || [];
      relatedArticles = items
        .filter((a: NewsArticle) => a.id !== article!.id)
        .slice(0, 5);
    }
  } catch (error) {
    console.error("Failed to fetch related articles:", error);
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "events":
        return "bg-blue-600";
      case "programs":
        return "bg-green-600";
      case "impact":
        return "bg-yellow-500 text-black";
      case "partnerships":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const displayedTitle = article.title;
  const displayedSubtitle = article.subtitle;
  const displayedExcerpt = article.excerpt;
  const displayedContent = article.contentHtml || article.contentMd;
  const imageUrls = article.imageUrl 
    ? article.imageUrl.split(",").map(url => getFullImageUrl(url.trim())) 
    : ["/images/placeholder.svg"];

  return (
    <>
      <Header />
      <Navigation />
      <div aria-hidden="true" className="h-16 sm:h-16 md:h-16 lg:h-24" />

      <main className="mt-8 sm:mt-12 md:mt-16 bg-white to-blue-50/30 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
          <Breadcrumbs currentLabel={t("articleLabel")} />
          <article className="grid lg:grid-cols-3 gap-10 items-start max-w-6xl mx-auto">
            <header className="lg:col-span-2">
              <div className="relative rounded-xl overflow-hidden shadow-lg ">
                <ImageSlideshow images={imageUrls} alt={displayedTitle} />
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(article.category)}`}
                    >
                      {t(`categories.${article.category.toLowerCase()}`)}
                    </span>
                    <p className="text-sm font-medium text-gray-500">
                      {new Date(article.publishAt || new Date()).toLocaleDateString(
                        locale === "kh" ? "km-KH" : locale || "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-primary">
                  {displayedTitle}
                </h1>
              </div>
              <div className="mt-6 bg-white rounded-xl shadow-md p-4 prose prose-neutral max-w-none text-gray-800">
                {displayedSubtitle ? (
                  <h2 className=" text-xl text-primary font-semibold">
                    {displayedSubtitle}
                  </h2>
                ) : null}
                {!displayedContent && displayedExcerpt ? (
                  <p className="mt-2 text-lg text-gray-700">{displayedExcerpt}</p>
                ) : null}
                {displayedContent ? (
                  <div
                    className="mt-4"
                    dangerouslySetInnerHTML={{
                      __html: displayedContent,
                    }}
                  />
                ) : null}
              </div>
            </header>

            <aside className="lg:col-span-1 mt-8">
              <div className="sticky top-24 space-y-4">
                <div className="bg-white rounded-xl shadow p-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    {t("relatedArticles")}
                  </h3>
                  <ul className="space-y-4">
                    {relatedArticles.map((a) => {
                      const relatedTitle = a.title;
                      const firstImgUrl = a.imageUrl ? a.imageUrl.split(",")[0].trim() : "";
                      const relatedImg = getFullImageUrl(firstImgUrl);
                      return (
                        <li key={a.id}>
                          <Link
                            href={`/Landing-page/News/${encodeURIComponent(a.slug || a.id)}`}
                            className="flex items-center gap-4 py-3 group"
                          >
                            <div className="relative w-36 h-24 shrink-0 rounded-md overflow-hidden shadow-sm">
                              <Image
                                src={relatedImg}
                                alt={relatedTitle}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                                {relatedTitle}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(a.publishAt || new Date()).toLocaleDateString(
                                  locale === "kh" ? "km-KH" : locale || "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </aside>
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
