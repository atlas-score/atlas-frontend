/** Stable URL fragment ids for compact evaluation sections */
export function compactSectionId(slug: string): string {
  return `compact-${slug}`;
}

export const COMPACT_EXPAND_QUERY = 'full';

const COMPACT_EXPAND_STORAGE_KEY = 'atlas-score-compact-expanded';

export function readCompactExpandedPreference(): boolean {
  try {
    return localStorage.getItem(COMPACT_EXPAND_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeCompactExpandedPreference(expanded: boolean): void {
  try {
    localStorage.setItem(COMPACT_EXPAND_STORAGE_KEY, expanded ? '1' : '0');
  } catch {
    // -- ignore
  }
}
