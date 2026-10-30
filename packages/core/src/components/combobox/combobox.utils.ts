/** An option that can be matched by its lowercased label, such as for typeahead or inline completion. */
export interface SearchableOption {
  disabled: boolean;
  searchLabel: string;
}

/** Trims values, drops empty entries, and removes duplicates while preserving order. */
export function normalizeValues(values: readonly string[]): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();
  values.forEach(value => {
    const trimmed = String(value).trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    normalized.push(trimmed);
  });
  return normalized;
}

/** Finds the first enabled option whose search label starts with `query`, searching forward from `startIndex` and wrapping. */
export function findTypeaheadMatch(options: readonly SearchableOption[], query: string, startIndex: number): number {
  for (let offset = 0; offset < options.length; offset++) {
    const index = (startIndex + offset) % options.length;
    const option = options[index];
    if (!option.disabled && option.searchLabel.startsWith(query)) return index;
  }
  return -1;
}

/** Returns the index of the first or last enabled option, or -1 when every option is disabled. */
export function findEdgeEnabledIndex(options: readonly SearchableOption[], edge: 'first' | 'last'): number {
  if (edge === 'first') return options.findIndex(option => !option.disabled);

  for (let index = options.length - 1; index >= 0; index--) {
    if (!options[index].disabled) return index;
  }
  return -1;
}
