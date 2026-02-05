import React from "react";
import Link from "next/link";

interface VideoCardProps {
  id?: string;
  embedUrl: string;
  title: string;
  description: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  id,
  embedUrl,
  title,
  description,
}) => {
  const content = (
    <>
      <div className="relative w-full aspect-video overflow-hidden">
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
          scrolling="no"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
      </div>
    </>
  );

  if (id) {
    return (
      <Link
        href={`/Landing_page/News/videos/${encodeURIComponent(id)}`}
        className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 block"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
      {content}
    </div>
  );
};

export default VideoCard;
