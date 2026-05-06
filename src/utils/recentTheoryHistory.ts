import type { AtlasEvaluation } from '../types/evaluation';
import { normalizeSlug } from './normalizeSlug';

export interface RecentTheoryView {
  id: string;
  viewedAt: string; // -- ISO string
}

const STORAGE_KEY = 'atlas.recentTheories.v1';
const MAX_REMEMBERED = 50;

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadRecentTheoryViews(): RecentTheoryView[] {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];
  const cleaned: RecentTheoryView[] = [];
  for (const item of parsed) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as any).id === 'string' &&
      typeof (item as any).viewedAt === 'string'
    ) {
      cleaned.push({ id: (item as any).id, viewedAt: (item as any).viewedAt });
    }
  }
  return cleaned.slice(0, MAX_REMEMBERED);
}

export function saveRecentTheoryViews(views: RecentTheoryView[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(views.slice(0, MAX_REMEMBERED))
  );
}

export function recordTheoryView(evaluation: AtlasEvaluation) {
  const now = new Date().toISOString();
  const existing = loadRecentTheoryViews();
  const target = normalizeSlug(evaluation.id);

  const next: RecentTheoryView[] = [
    { id: evaluation.id, viewedAt: now },
    ...existing.filter((v) => normalizeSlug(v.id) !== target),
  ].slice(0, MAX_REMEMBERED);

  saveRecentTheoryViews(next);
}

