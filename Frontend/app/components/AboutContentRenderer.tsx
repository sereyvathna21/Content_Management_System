import React, { useCallback } from "react";
import Image from "next/image";
import { ContentSection, AboutTopic } from "../data/aboutContent";
import { useTranslations, useLocale } from "next-intl";
import {
  getLocalizedText,
  getLocalizedContent,
  isHtmlString,
  renderWithLeadNumber,
  isNumberedItem,
  type LocaleType,
  type BilingualContent,
} from "../lib/textRenderUtils";

interface SectionRendererProps {
  section: ContentSection;
  level?: number;
}

const SectionRenderer = React.memo(function SectionRenderer({
  section,
  level = 2,
}: SectionRendererProps) {
  const locale = useLocale() as LocaleType;

  const renderContent = useCallback(
    (content: BilingualContent) => {
      const localizedContent = getLocalizedContent(content, locale);

      if (Array.isArray(localizedContent)) {
        return localizedContent.map((paragraph, idx) => {
          if (typeof paragraph === "string" && isHtmlString(paragraph)) {
            return (
              <p
                key={idx}
                className={`text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-3 sm:mb-4 text-justify ${
                  locale === "kh" ? "indent-6" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: paragraph }}
              />
            );
          }

          const numbered = isNumberedItem(paragraph as string);

          return (
            <p
              key={idx}
              className={`text-base sm:text-lg md:text-xl leading-relaxed mb-3 sm:mb-4 text-justify ${
                locale === "kh" ? "indent-6" : ""
              } ${numbered ? "font-bold text-gray-900" : "text-gray-700"}`}
            >
              {renderWithLeadNumber(paragraph as string, locale)}
            </p>
          );
        });
      }

      if (
        typeof localizedContent === "string" &&
        isHtmlString(localizedContent)
      ) {
        return (
          <p
            className={`text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-3 sm:mb-4 text-justify ${
              locale === "kh" ? "indent-6" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: localizedContent }}
          />
        );
      }

      return (
        <p
          className={`text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-3 sm:mb-4 text-justify ${
            locale === "kh" ? "indent-6" : ""
          }`}
        >
          {renderWithLeadNumber(localizedContent as string, locale)}
        </p>
      );
    },
    [locale],
  );

  const renderImage = useCallback(
    (image: ContentSection["image"]) => {
      if (!image) return null;
      const src = typeof image.src === "string" ? image.src : image.src[locale];

      return (
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={getLocalizedText(image.alt, locale)}
            width={800}
            height={500}
            className="w-full h-auto object-cover"
          />
          {image.caption && (
            <p className="text-xs sm:text-sm text-gray-600 italic mt-2 text-center">
              {getLocalizedText(image.caption, locale)}
            </p>
          )}
        </div>
      );
    },
    [locale],
  );

  const renderImages = useCallback(
    (images?: ContentSection["images"]) => {
      if (!images || images.length === 0) return null;

      return (
        <div
          className={`grid ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-4 my-6`}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-lg">
              <Image
                src={img.src}
                alt={getLocalizedText(img.alt, locale)}
                width={400}
                height={300}
                className="w-full h-auto object-cover"
              />
              {img.caption && (
                <p className="text-xs sm:text-sm text-gray-600 italic mt-2 text-center">
                  {getLocalizedText(img.caption, locale)}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    },
    [locale],
  );

  const getHeadingClass = (lvl: number) => {
    switch (lvl) {
      case 2:
        return "text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4";
      case 3:
        return "text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4";
      case 4:
        return "text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3";
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
            {getLocalizedText(section.title, locale)}
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
          className={`flex flex-col ${imagePosition === "right" ? "md:flex-row" : "md:flex-row-reverse"} gap-6 items-start`}
        >
          <div className="md:w-1/2">{renderContent(section.content)}</div>
          <div className="md:w-1/2">{renderImage(section.image)}</div>
        </div>
      ) : (
        // Default: content without side-by-side image
        <div>{renderContent(section.content)}</div>
      )}

      {/* Multiple images */}
      {hasMultipleImages && renderImages(section.images)}

      {/* Image at bottom */}
      {hasImage && imagePosition === "bottom" && (
        <div className="mt-6">{renderImage(section.image)}</div>
      )}

      {/* Render subsections */}
      {section.subsections &&
        section.subsections.map((subsection) => (
          <SectionRenderer
            key={subsection.id}
            section={subsection}
            level={level + 1}
          />
        ))}
    </div>
  );
});

interface AboutContentRendererProps {
  topic: AboutTopic;
  showHeader?: boolean;
}

const AboutContentRenderer = React.memo(function AboutContentRenderer({
  topic,
  showHeader = true,
}: AboutContentRendererProps) {
  const t = useTranslations("SocialPage");
  const locale = useLocale() as LocaleType;

  return (
    <div>
      {showHeader && (
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
            {topic.title[locale] || topic.title.en}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
            {topic.subtitle[locale] || topic.subtitle.en}
          </p>
          <div className="h-1 w-16 sm:w-20 lg:w-32 bg-primary mt-3 sm:mt-4 lg:mt-6"></div>
        </div>
      )}

      {topic.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} level={2} />
      ))}

      {topic.subTopics &&
        topic.subTopics.map((sub) => (
          <div key={sub.id} className="mt-6 sm:mt-8 lg:mt-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
              {sub.title[locale] || sub.title.en}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
              {sub.subtitle[locale] || sub.subtitle.en}
            </p>
            <div className="h-1 w-12 sm:w-16 lg:w-24 bg-primary mt-3 sm:mt-4 lg:mt-6"></div>

            {sub.sections.map((section) => (
              <SectionRenderer key={section.id} section={section} level={3} />
            ))}
          </div>
        ))}

      <div className="mt-6 sm:mt-8 lg:mt-12 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200">
        <p className="text-xs sm:text-sm md:text-base text-gray-600 italic">
          {t("reference")}:{" "}
        </p>
        {topic.reference &&
          (() => {
            const ref = topic.reference[locale] || topic.reference.en;
            if (Array.isArray(ref)) {
              return (
                <ul className="mt-2 list-disc list-inside text-xs sm:text-sm md:text-base text-gray-600">
                  {ref.map((r, i) => (
                    <li key={i} className="font-bold text-primary">
                      {r}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p className="mt-2 text-xs sm:text-sm md:text-base font-bold text-primary">
                {ref}
              </p>
            );
          })()}
      </div>
    </div>
  );
});

export default AboutContentRenderer;
