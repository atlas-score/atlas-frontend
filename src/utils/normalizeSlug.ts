export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .replace(/[\\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

