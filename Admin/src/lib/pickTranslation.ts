export type LawTranslationLite = {
    id?: string;
    language: string;
    title: string;
    description?: string;
    pdfUrl?: string;
    category?: string;
};

export function pickTranslation(
    translations: LawTranslationLite[],
    locale?: string,
    fallbackTitle = "Law"
): LawTranslationLite {
    const normalized = locale === "kh" ? "km" : locale;
    const match = normalized
        ? translations.find((tr) => tr.language === normalized)
        : undefined;

    return (
        match ??
        translations.find((tr) => tr.language === "en") ??
        translations[0] ??
        { language: normalized ?? "en", title: fallbackTitle }
    );
}
