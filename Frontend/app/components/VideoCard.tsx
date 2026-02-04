import React from "react";

interface VideoCardProps {
  embedUrl: string;
  title: string;
  description: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  embedUrl,
  title,
  description,
}) => {
  return (
    <div className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="relative w-full aspect-video overflow-hidden">
        <iframe
          src={embedUrl}
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
      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default VideoCard;
