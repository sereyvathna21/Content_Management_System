import Link from "next/link";
import React from "react";

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

// Map category to color
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "events":
      return "bg-blue-600";
    case "programs":
      return "bg-green-600";
    case "impact":
      return "bg-yellow-500 text-black";
    case "partnerships":
      return "bg-purple-600";
    default:
      return "bg-gray-600";
  }
};

export default function NewsCard({
  id,
  title,
  excerpt,
  date,
  category,
  image,
}: NewsCardProps) {
  return (
    <Link href={`/Landing-page/News/${id}`}>
      <article className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative w-full aspect-video overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />

          <div className="absolute top-2 left-2">
            <time className="text-xs sm:text-sm font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
              {date}
            </time>
          </div>

          <div
            className={`absolute top-2 right-2 rounded-md font-semibold text-white text-xs sm:text-sm px-2 py-1 ${getCategoryColor(category)}`}
          >
            {category}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 flex-1 flex flex-col">
          <h3
            title={title}
            className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate whitespace-nowrap group-hover:text-primary transition-colors"
          >
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 flex-1">
            {excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}
