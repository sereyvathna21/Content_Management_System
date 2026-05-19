"use client";
import React, { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import VideoPlayerCard from "./VideoPlayerCard";

type Video = {
  id: string;
  title: string;
  date: string;
  embedUrl: string;
  category: string;
  description?: string;
};

export default function AllVideosPlayer({
  initialVideo,
  videos,
}: {
  initialVideo: Video;
  videos: Video[];
}) {
  const t = useTranslations("NewsPage");
  const [selected, setSelected] = useState<Video>(initialVideo);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [displayVideos, setDisplayVideos] = useState<Video[]>(() => 
    videos.filter((v) => v.id !== initialVideo.id)
  );

  useEffect(() => {
    const filtered = videos.filter((v) => v.id !== selected.id);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setDisplayVideos(shuffled);
  }, [selected, videos]);

  const select = (v: Video) => {
    setSelected(v);
    // smooth scroll to player
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Main Video Area */}
      <div ref={playerRef} className="flex-1 lg:w-[65%] xl:w-[70%] flex flex-col">
        <div className="w-full">
          <VideoPlayerCard video={selected} />
        </div>

        {/* Video Info */}
        <div className="mt-5 px-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
            {selected.title}
          </h1>
          {selected.date && (
            <p className="text-sm text-gray-500 mt-2">{selected.date}</p>
          )}
          {selected.description && (
            <div className="mt-5 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
              <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base break-words">
                {selected.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Playlist / Recommended Videos */}
      <div className="w-full lg:w-[35%] xl:w-[30%] mt-8 lg:mt-0 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col h-full lg:h-[850px] overflow-hidden shadow-sm">
          <div className="px-6 py-5 shrink-0 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              {t("allVideos")}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
          {displayVideos.map((v) => {
            const displayedTitle = v.title;

            // Extract YouTube ID to show a clean image thumbnail instead of an iframe
            let ytId = null;
            if (v.embedUrl) {
              const match = v.embedUrl.match(
                /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
              );
              if (match && match[1].length === 11) {
                ytId = match[1];
              }
            }

            return (
              <button
                key={v.id}
                onClick={() => select(v)}
                className="flex gap-3 text-left w-full rounded-xl transition-all duration-200 focus:outline-none group"
              >
                <div className="w-40 sm:w-48 lg:w-44 xl:w-52 shrink-0 aspect-video rounded-xl overflow-hidden bg-gray-100 relative">
                  {ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={displayedTitle}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <iframe
                      title={displayedTitle}
                      src={v.embedUrl}
                      loading="lazy"
                      className="w-full h-full pointer-events-none"
                      tabIndex={-1}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl"></div>
                </div>

                <div className="flex flex-col justify-start py-0.5 flex-1 pr-2 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                    {displayedTitle}
                  </h3>
                  {v.date && (
                    <span className="text-xs text-gray-500 mt-1.5 truncate">{v.date}</span>
                  )}
                </div>
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
