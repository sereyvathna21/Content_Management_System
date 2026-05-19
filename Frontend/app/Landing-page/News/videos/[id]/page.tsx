import React from "react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/app/components/Home/Header";
import Footer from "@/app/components/Home/Footer";
import Navigation from "@/app/components/Home/Navigation";
import Breadcrumbs from "@/app/components/New/Breadcrumbs";
import AllVideosPlayer from "@/app/components/New/AllVideosPlayer";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default async function VideoPage({
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

  // Fetch videos from public API
  let apiVideos: any[] = [];
  try {
    const res = await fetch(
      `${backendUrl}/api/public/videos?lang=${lang}&page=1&pageSize=100`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const data = await res.json();
      apiVideos = data.items || data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch videos:", error);
  }

  // Map API fields to properties expected by page components
  const mappedVideos = apiVideos.map((video: any) => ({
    id: video.id,
    title: video.title,
    description: video.description || "",
    embedUrl: video.embedUrl,
    category: video.category || "",
    date: video.publishAt ? video.publishAt.split("T")[0] : "",
  }));

  // Try to find by id first, then try by slugified title fallback
  let video = mappedVideos.find((v) => v.id === id);
  if (!video) {
    const slug = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    video = mappedVideos.find((v) => slug(v.title) === slug(id));
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

          <div className="max-w-7xl mx-auto w-full">
            <article className="mx-auto w-full space-y-6">
              <div className="w-full">
                <AllVideosPlayer initialVideo={video} videos={mappedVideos} />
              </div>
            </article>
          </div>
        </div>{" "}
      </main>
      <Footer />
    </>
  );
}
