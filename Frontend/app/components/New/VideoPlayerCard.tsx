"use client";
import React from "react";



type Video = {
  id: string;
  title: string;
  date: string;
  embedUrl: string;
  category: string;
  description?: string;
};

export default function VideoPlayerCard({ video }: { video: Video }) {


  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={video.embedUrl}
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ border: "none" }}
          scrolling="no"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
