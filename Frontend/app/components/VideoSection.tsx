import React from "react";
import VideoCard from "./VideoCard";

interface Video {
  embedUrl: string;
  title: string;
  description: string;
}

interface VideoSectionProps {
  videos: Video[];
  videosPerPage: number;
  currentPage: number;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  videos,
  videosPerPage,
  currentPage,
}) => {
  const paginatedVideos = videos.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedVideos.map((video, index) => (
        <VideoCard
          key={index}
          embedUrl={video.embedUrl}
          title={video.title}
          description={video.description}
        />
      ))}
    </div>
  );
};

export default VideoSection;
