import React from "react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/app/components/Home/Header";
import Image from "next/image";

import Footer from "@/app/components/Home/Footer";
import Navigation from "@/app/components/Home/Navigation";
import ShareControls from "@/app/components/ShareControls";
import Breadcrumbs from "@/app/components/New/Breadcrumbs";
import Link from "next/link";
import { NewsArticle, PaginatedResponse } from "@/types/api";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";

const getFullImageUrl = (url: string | null | undefined) => {
  if (!url) return "/images/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${backendUrl}${url}`;
  }
  return `${backendUrl}/${url}`;
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
      `${backendUrl}/api/public/news/${encodeURIComponent(id)}?lang=${lang}`,
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
      `${backendUrl}/api/public/news?lang=${lang}&page=1&pageSize=6`,
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
                {imageUrls.length > 1 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 w-full h-72 sm:h-96">
                    <div className="w-full h-full relative">
                      <Image src={imageUrls[0]} alt={displayedTitle} fill className="object-cover" />
                    </div>
                    <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full hidden sm:grid">
                      {imageUrls.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="w-full h-full relative">
                          <Image src={img} alt={`${displayedTitle} ${idx + 1}`} fill className="object-cover" />
                          {idx === 3 && imageUrls.length > 5 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-xl font-bold">+{imageUrls.length - 5}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-72 sm:h-96">
                    <Image
                      src={imageUrls[0]}
                      alt={displayedTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}
                    >
                      {t(`categories.${article.category.toLowerCase()}`)}
                    </span>
                    <p className="text-xs text-gray-200">
                      {new Date(article.publishAt || new Date()).toLocaleDateString(
                        locale === "kh" ? "km-KH" : locale || "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold leading-tight">
                    {displayedTitle}
                  </h1>
                </div>
              </div>
              <div className="mb-4 items-center flex justify-end">
                <ShareControls />
              </div>
              <div className="mt-6 bg-white rounded-xl shadow-md p-4 prose prose-neutral max-w-none text-gray-800">
                {displayedSubtitle ? (
                  <h2 className=" text-xl text-primary font-semibold">
                    {displayedSubtitle}
                  </h2>
                ) : null}
                <p className="mt-2 text-lg text-gray-700">{displayedExcerpt}</p>
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
                            className="flex items-center gap-3 py-2"
                          >
                            <div className="relative w-28 h-16 shrink-0 rounded overflow-hidden">
                              <Image
                                src={relatedImg}
                                alt={relatedTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="text-base">
                              <div className="font-medium text-gray-800 line-clamp-2">
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
