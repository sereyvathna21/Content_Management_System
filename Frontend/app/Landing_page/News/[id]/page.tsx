import React from "react";
import { notFound } from "next/navigation";
import { newsArticles } from "../articles";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Navigation from "@/app/components/Navigation";
import ShareControls from "@/app/components/ShareControls";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import Link from "next/link";

export default async function ArticlePage({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolvedParams = await params;
  const raw =
    resolvedParams.Article ??
    resolvedParams.article ??
    resolvedParams.id ??
    resolvedParams.slug ??
    "";
  const id = decodeURIComponent(raw);

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

  return (
    <>
      <Header />
      <Navigation />
      <div aria-hidden="true" className="h-16 sm:h-16 md:h-16 lg:h-24" />

      <main className="mt-8 sm:mt-12 md:mt-16 bg-white to-blue-50/30 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
          <Breadcrumbs currentLabel="Article" />
          <article className="grid lg:grid-cols-3 gap-10 items-start max-w-6xl mx-auto">
            <header className="lg:col-span-2">
              <div className="relative rounded-xl overflow-hidden shadow-lg ">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-72 sm:h-96 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}
                    >
                      {article.category}
                    </span>
                    <p className="text-xs text-gray-200">{article.date}</p>
                  </div>
                  <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold leading-tight">
                    {article.title}
                  </h1>
                </div>
              </div>
              <div className="mb-4 items-center flex justify-end">
                <ShareControls />
              </div>
              <div className="mt-6 bg-white rounded-xl shadow-md p-4 prose prose-neutral max-w-none text-gray-800">
                {"subtitle" in article && (article as any).subtitle ? (
                  <h2 className=" text-xl text-primary font-semibold">
                    {(article as any).subtitle}
                  </h2>
                ) : null}
                <p className="mt-2 text-lg text-gray-700">{article.excerpt}</p>
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
                    Related articles
                  </h3>
                  <ul className="space-y-4">
                    {newsArticles
                      .filter((a) => a.id !== article.id)
                      .slice(0, 5)
                      .map((a) => (
                        <li key={a.id}>
                          <Link
                            href={`/Landing_page/News/${encodeURIComponent(a.id)}`}
                            className="flex items-center gap-3 py-2"
                          >
                            <img
                              src={a.image}
                              alt={a.title}
                              className="w-28 h-16 object-cover rounded"
                            />
                            <div className="text-base">
                              <div className="font-medium text-gray-800">
                                {a.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {a.date}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
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
