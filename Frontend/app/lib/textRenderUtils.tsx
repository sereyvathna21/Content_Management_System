import React from "react";

export type LocaleType = "en" | "kh";

// Type alias for bilingual content
export type BilingualText = string | { en: string; kh: string };

export type BilingualContent =
  | string
  | string[]
  | { en: string[]; kh: string[] }
  | { en: string; kh: string }
  | { en: string | string[]; kh: string | string[] };

// Locale-specific phrases to highlight
export const LOCALE_PHRASES: Record<LocaleType, string[]> = {
  en: [
    "General Secretariat of the National Council for Social Protection",
    "Digital Transformation in the Social Protection Sub-commitee",
    "Digital SP",
    "Roadmap towards Universal Health Coverage in Cambodia 2024-2035",
    "UHC Sub-Committee",
    "UHCC",
  ],
  kh: [
    "អគ្គលេខាធិការដ្ឋានក្រុមប្រឹក្សាជាតិគាំពារសង្គម",
    "អនុគណៈកម្មាធិការទទួលបន្ទុកបរិវត្តកម្មឌីជីថលក្នុងប្រព័ន្ធគាំពារសង្គម",
    "អ.ប.ប.",
    "អ.គ.ស.ស.",
    "ផែនទីបង្ហាញផ្លូវ ឆ្ពោះទៅការគ្របដណ្តប់ សុខភាពជាសកលនៅកម្ពុជា ឆ្នាំ២០២៤-២០៣៥",
  ],
};

// Khmer digits for number detection
export const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";

/**
 * Check if a string contains HTML tags
 */
export function isHtmlString(s: string): boolean {
  return /<[^>]+>/.test(s);
}

/**
 * Escape special regex characters
 */
export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Render a paragraph with specific phrases highlighted in bold
 */
export function renderParagraphWithHighlights(
  paragraph: string,
  locale: LocaleType,
): Array<string | React.ReactNode> {
  const phrases = LOCALE_PHRASES[locale] || [];
  if (phrases.length === 0) return [paragraph];

  const regex = new RegExp(`(${phrases.map(escapeRegExp).join("|")})`, "g");
  const splitParts = paragraph.split(regex);
  const parts: Array<string | React.ReactNode> = [];

  splitParts.forEach((part, i) => {
    if (phrases.includes(part)) {
      parts.push(
        <strong key={`ph-${i}`} className="font-bold">
          {part}
        </strong>,
      );
    } else {
      parts.push(part);
    }
  });

  return parts;
}

/**
 * Render text with leading numbers (English or Khmer) separated and highlighted
 */
export function renderWithLeadNumber(
  paragraph: string,
  locale: LocaleType,
): React.ReactNode {
  // Match leading whitespace, then number (arabic or khmer), optional dot or parenthesis, then optional whitespace
  const engRegex = /^\s*(\d+\s*[\.|\)]?\s*)/;
  const khRegex = new RegExp(`^\\s*([${KHMER_DIGITS}]+\\s*[\\.\\|\\)]?\\s*)`);

  const engMatch = paragraph.match(engRegex);
  const khMatch = paragraph.match(khRegex);

  if (engMatch) {
    const token = engMatch[1];
    const rest = paragraph.replace(engRegex, "");
    const highlighted = renderParagraphWithHighlights(rest, locale);
    return (
      <>
        {token}
        {Array.isArray(highlighted) ? highlighted : highlighted}
      </>
    );
  }

  if (khMatch) {
    const token = khMatch[1];
    const rest = paragraph.replace(khRegex, "");
    const highlighted = renderParagraphWithHighlights(rest, locale);
    return (
      <>
        {token}
        {Array.isArray(highlighted) ? highlighted : highlighted}
      </>
    );
  }

  return renderParagraphWithHighlights(paragraph, locale);
}

/**
 * Check if a paragraph starts with a number (for composition lists)
 */
export function isNumberedItem(paragraph: string): boolean {
  const engRegex = /^\s*(\d+\s*[\.|\)]?\s*)/;
  const khRegex = new RegExp(`^\\s*([${KHMER_DIGITS}]+\\s*[\\.\\|\\)]?\\s*)`);
  return engRegex.test(paragraph) || khRegex.test(paragraph);
}

/**
 * Get localized text from bilingual content
 */
export function getLocalizedText(
  text: BilingualText | undefined,
  locale: LocaleType,
): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[locale] || text.en;
}

/**
 * Get localized content from various content formats
 */
export function getLocalizedContent(
  content: BilingualContent,
  locale: LocaleType,
): string | string[] {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content;
  if ("en" in content && "kh" in content) {
    const localized = content[locale] || content.en;
    return localized;
  }
  return content;
}
