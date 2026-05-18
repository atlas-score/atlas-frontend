import type { AtlasEvaluation } from '../types/evaluation';
import { normalizeSlug } from './normalizeSlug';

export function pickRandomEvaluation(
  examples: AtlasEvaluation[],
  excludeId: string
): AtlasEvaluation | null {
  const exclude = normalizeSlug(excludeId);
  const pool = examples.filter((e) => normalizeSlug(e.id) !== exclude);
  if (pool.length === 0) return null;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}
