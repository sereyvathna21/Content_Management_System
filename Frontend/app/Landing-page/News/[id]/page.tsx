import React from "react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { newsArticles } from "@/app/Landing-page/News/articles";
import Header from "@/app/components/Header";
import Image from "next/image";
import Footer from "@/app/components/Footer";
import Navigation from "@/app/components/Navigation";
import ShareControls from "@/app/components/ShareControls";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import Link from "next/link";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("NewsPage");
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id);

  // try to find by id first, then try by slugified title fallback
  let article = newsArticles.find((a) => a.id === id);
  if (!article) {
    const slug = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    article = newsArticles.find((a) => slug(a.title) === slug(id));
  }
  if (!article) return notFound();
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

  const titleKey = `content.articles.${article.id}.title`;
  const subtitleKey = `content.articles.${article.id}.subtitle`;
  const excerptKey = `content.articles.${article.id}.excerpt`;
  const displayedTitle = t(titleKey) !== titleKey ? t(titleKey) : article.title;
  const displayedSubtitle = (article as any).subtitle
    ? t(subtitleKey) !== subtitleKey
      ? t(subtitleKey)
      : (article as any).subtitle
    : undefined;
  const displayedExcerpt =
    t(excerptKey) !== excerptKey ? t(excerptKey) : article.excerpt;

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
                <Image
                  src={article.image}
                  alt={displayedTitle}
                  className="w-full h-72 sm:h-96 object-cover rounded-xl"
                  width={1200}
                  height={640}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}
                    >
                      {t(`categories.${article.category.toLowerCase()}`)}
                    </span>
                    <p className="text-xs text-gray-200">
                      {new Date(article.date).toLocaleDateString(
                        locale || "en-US",
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
                {"content" in article && (article as any).content ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (article as any).content,
                    }}
                  />
                ) : null}
              </div>
            </header>

            <aside className="lg:col-span-1 mt-8">
              <div className="sticky top-24 space-y-4">
                <div className="bg-white rounded-xl shadow p-4">
                  <h3 className="text-sm font-semibold text-primary mb-3">
                    {t("relatedArticles")}
                  </h3>
                  <ul className="space-y-4">
                    {newsArticles
                      .filter((a) => a.id !== article.id)
                      .slice(0, 5)
                      .map((a) => {
                        const relatedTitleKey = `content.articles.${a.id}.title`;
                        const relatedTitle =
                          t(relatedTitleKey) !== relatedTitleKey
                            ? t(relatedTitleKey)
                            : a.title;
                        return (
                          <li key={a.id}>
                            <Link
                              href={`/Landing-page/News/${encodeURIComponent(a.id)}`}
                              className="flex items-center gap-3 py-2"
                            >
                              <Image
                                src={a.image}
                                alt={relatedTitle}
                                width={112}
                                height={64}
                                className="w-28 h-16 object-cover rounded"
                              />
                              <div className="text-base">
                                <div className="font-medium text-gray-800">
                                  {relatedTitle}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(a.date).toLocaleDateString(
                                    locale || "en-US",
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
