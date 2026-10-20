const localeCache = new Map<string, string>();

/** Returns a canonical BCP 47 locale, falling back to English for invalid platform values. */
export function normalizeLocale(locale: string): string {
  const cached = localeCache.get(locale);
  if (cached !== undefined) return cached;

  const baseLocale = locale.split('@', 1)[0] || 'en';
  let normalized = 'en';

  try {
    normalized = Intl.getCanonicalLocales(baseLocale)[0] ?? 'en';
  } catch {
    normalized = 'en';
  }

  localeCache.set(locale, normalized);
  return normalized;
}
