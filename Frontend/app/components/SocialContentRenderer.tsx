import React from "react";
import Image from "next/image";
import { ContentSection, SocialTopic } from "../data/socialContent";
import { useTranslations, useLocale } from "next-intl";

interface SectionRendererProps {
  section: ContentSection;
  level?: number;
}

function SectionRenderer({ section, level = 2 }: SectionRendererProps) {
  const locale = useLocale() as "en" | "kh";

  // Helper function to get localized text
  const getLocalizedText = (
    text: string | { en: string; kh: string },
  ): string => {
    if (typeof text === "string") return text;
    return text[locale] || text.en;
  };

  // Helper function to get localized content
  const getLocalizedContent = (
    content:
      | string
      | string[]
      | { en: string[]; kh: string[] }
      | { en: string; kh: string }
      | { en: string | string[]; kh: string | string[] },
  ): string | string[] => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content;
    if ("en" in content && "kh" in content) {
      const localized = content[locale] || content.en;
      return localized;
    }
    return content;
  };

  // Helper function to bold entire text if it has numbering pattern
  const formatTextWithBoldNumbers = (text: string) => {
    const patterns = [
      // Khmer numbers with dots: ១. ១.១ ១.២.៣
      /^([០១២៣៤៥៦៧៨៩]+(?:\.[០១២៣៤៥៦៧៨៩]+)*\.?\s)/,
      // Khmer consonants: ក. ខ. គ. etc.
      /^([កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអ]\.?\s)/,
      // English numbers with dots: 1. 1.1 1.2.3
      /^(\d+(?:\.\d+)*\.?\s)/,
      // Letters in parentheses: (a) (b) etc.
      /^(\([a-z]\)\s)/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return <span className="font-bold">{text}</span>;
      }
    }
    return text;
  };

  const renderContent = (
    content:
      | string
      | string[]
      | { en: string[]; kh: string[] }
      | { en: string; kh: string }
      | { en: string | string[]; kh: string | string[] },
  ) => {
    const localizedContent = getLocalizedContent(content);

    if (Array.isArray(localizedContent)) {
      return localizedContent.map((paragraph, idx) => (
        <p
          key={idx}
          className={`text-base sm:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4 text-justify-full ${locale === "kh" ? "indent-6" : ""}`}
        >
          {formatTextWithBoldNumbers(paragraph)}
        </p>
      ));
    }
    return (
      <p
        className={`text-base sm:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4 text-justify-full ${locale === "kh" ? "indent-6" : ""}`}
      >
        {formatTextWithBoldNumbers(localizedContent)}
      </p>
    );
  };

  const renderImage = (image: ContentSection["image"]) => {
    if (!image) return null;

    const imageElement = (
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={image.src}
          alt={getLocalizedText(image.alt)}
          width={800}
          height={500}
          className="w-full h-auto object-cover"
        />
        {image.caption && (
          <p className="text-sm text-gray-600 italic mt-2 text-center">
            {getLocalizedText(image.caption)}
          </p>
        )}
      </div>
    );

    return imageElement;
  };

  const renderImages = (images?: ContentSection["images"]) => {
    if (!images || images.length === 0) return null;

    return (
      <div
        className={`grid ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-4 my-6`}
      >
        {images.map((img, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-lg">
            <Image
              src={img.src}
              alt={getLocalizedText(img.alt)}
              width={400}
              height={300}
              className="w-full h-auto object-cover"
            />
            {img.caption && (
              <p className="text-sm text-gray-600 italic mt-2 text-center">
                {getLocalizedText(img.caption)}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getHeadingClass = (lvl: number) => {
    switch (lvl) {
      case 2:
        return "text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4";
      case 3:
        return "text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4";
      case 4:
        return "text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3";
      case 5:
        return "text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3";
      default:
        return "text-sm sm:text-base font-semibold text-gray-800 mb-2";
    }
  };

  const HeadingTag = `h${Math.min(level, 6)}` as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";

  // Determine layout based on image position
  const imagePosition = section.image?.position || "top";
  const hasImage = section.image;
  const hasMultipleImages = section.images && section.images.length > 0;

  return (
    <div
      className={
        level === 2
          ? "mb-8 sm:mb-12"
          : level === 3
            ? "mb-6 sm:mb-10"
            : "mb-4 sm:mb-6"
      }
    >
      {section.title && (
        <>
          <HeadingTag className={getHeadingClass(level)}>
            {getLocalizedText(section.title)}
          </HeadingTag>
          {level === 2 && (
            <div className="h-1 w-16 sm:w-24 bg-primary mb-4 sm:mb-6"></div>
          )}
        </>
      )}

      {/* Image at top or full width */}
      {hasImage && (imagePosition === "top" || imagePosition === "full") && (
        <div
          className={`mb-6 ${imagePosition === "full" ? "-mx-8 lg:-mx-12" : ""}`}
        >
          {renderImage(section.image)}
        </div>
      )}

      {/* Left/Right layout */}
      {hasImage && (imagePosition === "left" || imagePosition === "right") ? (
        <div
          className={`flex flex-col ${imagePosition === "left" ? "md:flex-row" : "md:flex-row-reverse"} gap-6 mb-6`}
        >
          <div className="md:w-1/2 flex-shrink-0">
            {renderImage(section.image)}
          </div>
          <div className="flex-1">
            {section.content && renderContent(section.content)}
          </div>
        </div>
      ) : (
        <>{section.content && renderContent(section.content)}</>
      )}

      {/* Image at bottom */}
      {hasImage && imagePosition === "bottom" && (
        <div className="mt-6">{renderImage(section.image)}</div>
      )}

      {/* Multiple images gallery */}
      {hasMultipleImages && renderImages(section.images)}

      {section.subsections && section.subsections.length > 0 && (
        <div
          className={
            level >= 4 ? "ml-3 sm:ml-6 mt-4 sm:mt-6 space-y-3 sm:space-y-5" : ""
          }
        >
          {section.subsections.map((subsection) => (
            <SectionRenderer
              key={subsection.id}
              section={subsection}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SocialContentRendererProps {
  topic: SocialTopic;
  showHeader?: boolean;
}

export default function SocialContentRenderer({
  topic,
  showHeader = true,
}: SocialContentRendererProps) {
  const t = useTranslations("SocialPage");
  const locale = useLocale() as "en" | "kh";

  // Helper function to get localized text
  const getLocalizedText = (
    text: string | { en: string; kh: string },
  ): string => {
    if (typeof text === "string") return text;
    return text[locale] || text.en;
  };

  return (
    <>
      {showHeader && (
        <div className="mb-6 sm:mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">
            {getLocalizedText(topic.category)}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-2 sm:mb-3">
            {getLocalizedText(topic.title)}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 text-justify-full">
            {getLocalizedText(topic.subtitle)}
          </p>
          <div className="h-px bg-gradient-to-r from-primary/30 via-gray-200 to-transparent mt-4 sm:mt-6"></div>
        </div>
      )}

      {topic.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200">
        <p className="text-sm sm:text-sm text-gray-600 italic">
          {t("reference")}:{" "}
          <span className="font-bold text-primary">
            {getLocalizedText(topic.reference)}
          </span>
        </p>
      </div>
    </>
  );
}
