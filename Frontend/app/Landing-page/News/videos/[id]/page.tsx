import React from "react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { videos } from "@/app/Landing-page/News/videos";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Navigation from "@/app/components/Navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import AllVideosPlayer from "@/app/components/AllVideosPlayer";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("NewsPage");
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id);

  // Try to find by id first, then try by slugified title fallback
  let video = videos.find((v) => v.id === id);
  if (!video) {
    const slug = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    video = videos.find((v) => slug(v.title) === slug(id));
  }
  if (!video) return notFound();

  return (
    <>
      <Header />
      <Navigation />
      {/* spacer to offset fixed Navigation height so page header is visible */}
      <div aria-hidden="true" className="h-18 sm:h-18 md:h-18 lg:h-28" />

      <main className="bg-white via-blue-50/20 to-indigo-50/30 min-h-screen mt-4 sm:mt-8 md:mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Breadcrumbs currentLabel={t("videoLabel")} />

          <div className="max-w-7xl mx-auto">
            <article className="mx-auto w-full max-w-6xl space-y-6">
              <div className="flex justify-center lg:justify-start px-0">
                <div className="w-max max-w-max sm:max-w-max md:max-w-max lg:max-w-max px-0 sm:px-0">
                  <AllVideosPlayer initialVideo={video} videos={videos} />
                </div>
              </div>
            </article>
          </div>
        </div>{" "}
      </main>
      <Footer />
    </>
  );
}
