import React from "react";
import Link from "next/link";

type Video = {
  id: string;
  title: string;
  embedUrl: string;
  category: string;
};

export default function RelatedVideos({
  videos,
  currentId,
}: {
  videos: Video[];
  currentId: string;
}) {
  const list = videos.filter((v) => v.id !== currentId).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-primary px-6 py-4">
        <h3 className="text-fluid-lg font-bold text-white flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Related Videos
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {list.map((v) => (
          <Link
            key={v.id}
            href={`/Landing_page/News/videos/${encodeURIComponent(v.id)}`}
            className="block p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50/50 transition-all duration-200 group"
          >
            <div className="flex gap-3">
              <div className="relative w-40 flex-shrink-0 aspect-video overflow-hidden rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <iframe
                  src={v.embedUrl}
                  width="100%"
                  height="100%"
                  className="absolute inset-0 pointer-events-none"
                  style={{ border: "none" }}
                  scrolling="no"
                  frameBorder="0"
                ></iframe>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-fluid-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                  {v.title}
                </h4>

                <span className="inline-block text-fluid-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {v.category}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
