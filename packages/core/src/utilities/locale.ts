/** Returns a canonical BCP 47 locale, falling back to English for invalid platform values. */
export function normalizeLocale(locale: string): string {
  const baseLocale = locale.split('@', 1)[0] || 'en';

  try {
    return Intl.getCanonicalLocales(baseLocale)[0] ?? 'en';
  } catch {
    return 'en';
  }
}
