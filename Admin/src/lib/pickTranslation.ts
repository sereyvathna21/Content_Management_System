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
    const normalizeLang = (lang?: string) => {
        if (!lang) return undefined;
        const lowered = lang.toLowerCase();
        return lowered === "kh" ? "km" : lowered;
    };

    const normalized = normalizeLang(locale);
    const match = normalized
        ? translations.find((tr) => normalizeLang(tr.language) === normalized)
        : undefined;

    return (
        match ??
        translations.find((tr) => tr.language === "en") ??
        translations[0] ??
        { language: normalized ?? "en", title: fallbackTitle }
    );
}
