export function normalizeText(input?: string) {
  const s = (input ?? "") + "";

  // but do NOT strip combining marks — Khmer uses combining signs.
  const cleaned = s
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  try {
    // For Khmer text, use NFC normalization (more appropriate for Khmer)
    const normalized = cleaned.normalize("NFC");
    // Use regular toLowerCase as toLocaleLowerCase() can be unreliable for Khmer
    return normalized.toLowerCase();
  } catch (err) {
    return cleaned.toLowerCase();
  }
}

export function matchesSearch(text?: string, query?: string) {
  if (!query) return true;
  const nq = normalizeText(query);
  const nt = normalizeText(text);

  // Quick direct match first (handles short queries and exact substrings)
  if (nt.includes(nq)) return true;

  // Tokenize query and require all tokens to be present (AND-match).
  // This helps when users enter multiple Khmer words or phrases.
  const tokens = nq.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((tok) => nt.includes(tok));
}

export function compareText(a?: string, b?: string, locale = "km") {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  try {
    return na.localeCompare(nb, locale, { sensitivity: "base" });
  } catch (e) {
    return na.localeCompare(nb);
  }
}

export default { normalizeText, matchesSearch, compareText };
