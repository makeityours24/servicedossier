export function normalizeInstallateurSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeInstallateurSearchQuery(query: string) {
  return normalizeInstallateurSearchValue(query)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

export function buildInstallateurSearchVariants(query: string) {
  const normalized = normalizeInstallateurSearchValue(query);
  const tokens = tokenizeInstallateurSearchQuery(query);

  return {
    normalized,
    tokens,
    compact: normalized.replace(/\s+/g, ""),
    postcodeCandidate: normalized.replace(/\s+/g, "").toUpperCase()
  };
}
