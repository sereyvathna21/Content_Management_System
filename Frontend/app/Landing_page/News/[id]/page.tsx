import React from "react";
import { notFound } from "next/navigation";
import { newsArticles } from "../articles";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Navigation from "@/app/components/Navigation";

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

  return (
    <>
      <Header />
      <Navigation />
      <div
        aria-hidden="true"
        style={{
          height:
            "calc(clamp(3rem, 8vw, 5rem) + clamp(1rem, 4vw, 2rem) + 0.75rem)",
        }}
      />

      <div className="min-h-screen mt-16 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-6 py-12 flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary text-left">
            {article.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2 text-left">
            PUBLISHED: {article.date} · {article.category}
          </p>
          <div className="mt-6 w-full max-w-3xl">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          <div className="mt-6 max-w-3xl text-gray-700 text-left">
            <p>{article.excerpt}</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
