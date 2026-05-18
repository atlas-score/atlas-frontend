import type { AtlasEvaluation } from '../types/evaluation';
import { normalizeSlug } from './normalizeSlug';

export function resolveEvaluationByIdSlug(
  idParam: string | undefined,
  examples: AtlasEvaluation[]
): AtlasEvaluation | null {
  if (!idParam) return null;
  const target = normalizeSlug(idParam);
  return examples.find((e) => normalizeSlug(e.id) === target) ?? null;
}
