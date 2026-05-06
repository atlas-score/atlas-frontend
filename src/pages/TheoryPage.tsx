import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import feed from '../../atlas-score-examples.json';
import type { AtlasEvaluation, ExamplesFeed } from '../types/evaluation';
import { normalizeSlug } from '../utils/normalizeSlug';
import { ScoreTriptych } from '../components/ScoreTriptych';
import { EvaluationDetail } from '../components/EvaluationDetail';
import { FuzzySearchBox } from '../components/FuzzySearchBox';
import { recordTheoryView } from '../utils/recentTheoryHistory';
import { useTheme } from '../context/ThemeContext';
import {
  formatSigned,
  getCompositeAccentColor,
  getCompositePositiveRampT,
  hexAlpha,
} from '../utils/scoreColor';
import { evaluationToMarkdown } from '../utils/evaluationToMarkdown';

const data = feed as ExamplesFeed;

function resolveEvaluationByIdSlug(
  idParam: string | undefined,
  examples: AtlasEvaluation[]
): AtlasEvaluation | null {
  if (!idParam) return null;
  const target = normalizeSlug(idParam);
  return examples.find((e) => normalizeSlug(e.id) === target) ?? null;
}

export function TheoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme: mode } = useTheme();
  const examples = data.examples;

  const evaluation = useMemo(
    () => resolveEvaluationByIdSlug(id, examples),
    [id, examples]
  );

  useEffect(() => {
    if (!evaluation || !id) return;
    if (normalizeSlug(evaluation.id) !== normalizeSlug(id)) return;
    if (evaluation.id === id) return;
    navigate(`/${evaluation.id}`, { replace: true });
  }, [evaluation, id, navigate]);

  useEffect(() => {
    if (!evaluation) return;
    recordTheoryView(evaluation);
  }, [evaluation]);

  if (!evaluation) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-black tracking-tight text-atlas-white">
          Theory not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-atlas-muted">
          We couldn&apos;t find an evaluation matching that URL.
        </p>
        <div className="mt-6">
          <Link
            to="/#explorer"
            className="inline-flex items-center rounded-atlas-pill border border-atlas-border bg-atlas-deep/60 px-4 py-2 text-sm font-bold text-atlas-white shadow-atlas-card transition-colors hover:border-atlas-border-glow hover:bg-atlas-deep"
          >
            Back to Explorer
          </Link>
        </div>
      </main>
    );
  }

  const copyAsMarkdown = async () => {
    const md = evaluationToMarkdown(evaluation);
    try {
      await navigator.clipboard.writeText(md);
      return;
    } catch {
      // -- Fallback for older browsers / permission issues
      const el = document.createElement('textarea');
      el.value = md;
      el.setAttribute('readonly', 'true');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-auto sm:min-w-[420px] sm:flex-1">
          <FuzzySearchBox
            evaluations={examples}
            placeholder="Search another theory…"
            onPick={(ev) => navigate(`/${ev.id}`)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyAsMarkdown}
            className="inline-flex items-center justify-center rounded-atlas-pill border border-atlas-border bg-atlas-deep/60 px-4 py-2 text-sm font-bold text-atlas-white shadow-atlas-card transition-colors hover:border-atlas-border-glow hover:bg-atlas-deep"
          >
            Copy as Markdown
          </button>
          <Link
            to="/#explorer"
            className="inline-flex items-center justify-center rounded-atlas-pill border border-atlas-border bg-atlas-deep/60 px-4 py-2 text-sm font-bold text-atlas-white shadow-atlas-card transition-colors hover:border-atlas-border-glow hover:bg-atlas-deep"
          >
            Back to Explorer
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-atlas-label">
          {evaluation.framework_status} · {evaluation.claim_type}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-black tracking-tight text-atlas-white sm:text-4xl">
            {evaluation.framework_name}
          </h1>
          <span
            className="inline-flex items-center rounded-full border border-atlas-border bg-atlas-deep/60 px-3 py-1.5 font-mono text-sm font-black shadow-atlas-card"
            style={{
              color: getCompositeAccentColor(evaluation.composite_score, mode),
              borderColor: hexAlpha(
                getCompositeAccentColor(evaluation.composite_score, mode),
                0.65
              ),
              ...(mode === 'night'
                ? {
                    boxShadow: `0 0 ${10 + getCompositePositiveRampT(evaluation.composite_score) * 16}px ${hexAlpha(
                      getCompositeAccentColor(evaluation.composite_score, mode),
                      0.28
                    )}`,
                  }
                : {}),
            }}
            aria-label={`Composite score ${formatSigned(evaluation.composite_score)}`}
          >
            {formatSigned(evaluation.composite_score)}
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-atlas-muted">
          {evaluation.specific_claim}
        </p>
      </div>

      <section className="mt-8" aria-label="Composite score">
        <div className="rounded-atlas-card border border-atlas-border bg-atlas-deep/60 p-6 shadow-atlas-card sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-atlas-label">
            Composite score
          </p>
          <p
            className="mt-2 font-mono text-5xl font-black sm:text-6xl"
            style={{
              color: getCompositeAccentColor(evaluation.composite_score, mode),
              ...(mode === 'day'
                ? { textShadow: 'none' }
                : {
                    textShadow: `0 0 ${16 + getCompositePositiveRampT(evaluation.composite_score) * 26}px ${hexAlpha(
                      getCompositeAccentColor(evaluation.composite_score, mode),
                      0.26 + getCompositePositiveRampT(evaluation.composite_score) * 0.36
                    )}`,
                  }),
            }}
          >
            {formatSigned(evaluation.composite_score)}
          </p>
        </div>
      </section>

      <section className="mt-8 space-y-3" aria-label="Base scores">
        <h2 className="text-xl font-bold uppercase tracking-widest text-atlas-white">
          Base scores
        </h2>
        <ScoreTriptych evaluation={evaluation} />
      </section>

      <section className="mt-8">
        <EvaluationDetail evaluation={evaluation} />
      </section>

      <div className="mt-10 flex justify-center">
        <Link
          to="/#explorer"
          className="inline-flex items-center rounded-atlas-pill border border-atlas-border bg-atlas-deep/60 px-5 py-2.5 text-sm font-bold text-atlas-white shadow-atlas-card transition-colors hover:border-atlas-border-glow hover:bg-atlas-deep"
        >
          Back to Explorer
        </Link>
      </div>
    </main>
  );
}

