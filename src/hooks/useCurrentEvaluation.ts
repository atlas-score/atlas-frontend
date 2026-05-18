import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { evaluations } from '../data/evaluations';
import { resolveEvaluationByIdSlug } from '../utils/resolveEvaluation';

export function useCurrentEvaluation() {
  const { id } = useParams();
  return useMemo(
    () => resolveEvaluationByIdSlug(id, evaluations),
    [id]
  );
}
