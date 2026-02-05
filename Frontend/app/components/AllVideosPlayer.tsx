"use client";
import React, { useRef, useState } from "react";
import VideoPlayerCard from "./VideoPlayerCard";
import Pagination from "./Pagination";

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
  const [selected, setSelected] = useState<Video>(initialVideo);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const select = (v: Video) => {
    setSelected(v);
    // smooth scroll to player
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div>
      <div
        ref={playerRef}
        className="flex justify-center lg:justify-start px-0"
      >
        <div className="w-full max-w-6xl px-0">
          <VideoPlayerCard video={selected} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">All videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videos
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((v) => (
              <button
                key={v.id}
                onClick={() => select(v)}
                className={`text-left block bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  v.id === selected.id ? "ring-4 ring-primary" : ""
                }`}
                aria-pressed={v.id === selected.id}
              >
                <div className="aspect-video bg-black">
                  <iframe
                    title={v.title}
                    src={v.embedUrl}
                    loading="lazy"
                    className="w-full h-full pointer-events-none"
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm sm:text-base font-medium text-gray-900">
                    {v.title}
                  </div>
                </div>
              </button>
            ))}
        </div>
        {Math.ceil(videos.length / itemsPerPage) > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(videos.length / itemsPerPage)}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
