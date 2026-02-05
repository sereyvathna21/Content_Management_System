import React from "react";
import { notFound } from "next/navigation";
import { videos } from "../../videos";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Navigation from "@/app/components/Navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import VideoPlayerCard from "@/app/components/VideoPlayerCard";
import RelatedVideos from "@/app/components/RelatedVideos";
import Link from "next/link";

export default async function VideoPage({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolvedParams = await params;
  const raw =
    resolvedParams.Video ??
    resolvedParams.video ??
    resolvedParams.id ??
    resolvedParams.slug ??
    "";
  const id = decodeURIComponent(raw);

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
      <div
        aria-hidden="true"
        style={{
          height:
            "calc(clamp(3rem, 8vw, 5rem) + clamp(1rem, 4vw, 2rem) + 0.75rem)",
        }}
      />

      <main className="bg-white via-blue-50/20 to-indigo-50/30 min-h-screen mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Breadcrumbs currentLabel="Video" />

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
            <article className="lg:col-span-8 space-y-6">
              <VideoPlayerCard video={video} />
            </article>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <RelatedVideos videos={videos} currentId={video.id} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
