import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { evaluations as examples } from '../data/evaluations';
import { useCurrentEvaluation } from '../hooks/useCurrentEvaluation';
import { normalizeSlug } from '../utils/normalizeSlug';
import { ScoreTriptych } from '../components/ScoreTriptych';
import { EvaluationDetail } from '../components/EvaluationDetail';
import { EvaluationDetailCompact } from '../components/EvaluationDetailCompact';
import { FuzzySearchBox } from '../components/FuzzySearchBox';
import { recordTheoryView } from '../utils/recentTheoryHistory';
import { useTheme } from '../context/ThemeContext';
import { useScoreLayout } from '../context/ScoreLayoutContext';
import { pickRandomEvaluation } from '../utils/pickRandomEvaluation';
import {
  formatSigned,
  getCompositeAccentColor,
  getCompositePositiveRampT,
  hexAlpha,
} from '../utils/scoreColor';
import { evaluationToMarkdown } from '../utils/evaluationToMarkdown';

export function TheoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme: mode } = useTheme();
  const { layout } = useScoreLayout();
  const isCompact = layout === 'compact';
  const evaluation = useCurrentEvaluation();

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

  const randomNext = () => {
    if (!evaluation) return;
    const next = pickRandomEvaluation(examples, evaluation.id);
    if (next) navigate(`/${next.id}`);
  };

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

  const canPickRandom = examples.length > 1;

  return (
    <main
      className={
        isCompact
          ? 'mx-auto max-w-6xl px-4 py-8 sm:px-6'
          : 'mx-auto max-w-5xl px-4 py-8 sm:px-6'
      }
    >
      <div className="w-full sm:min-w-[420px]">
        <FuzzySearchBox
          evaluations={examples}
          placeholder="Search another theory…"
          onPick={(ev) => navigate(`/${ev.id}`)}
        />
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-atlas-label">
          {evaluation.framework_status} · {evaluation.claim_type}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {!isCompact ? (
            <>
              <h2 className="font-display text-3xl font-black tracking-tight text-atlas-white sm:text-4xl">
                {evaluation.framework_name}
              </h2>
              <span
                className="inline-flex items-center rounded-full border border-atlas-border bg-atlas-deep/60 px-3 py-1.5 font-mono text-sm font-black shadow-atlas-card"
                style={{
                  color: getCompositeAccentColor(
                    evaluation.composite_score,
                    mode
                  ),
                  borderColor: hexAlpha(
                    getCompositeAccentColor(
                      evaluation.composite_score,
                      mode
                    ),
                    0.65
                  ),
                  ...(mode === 'night'
                    ? {
                        boxShadow: `0 0 ${10 + getCompositePositiveRampT(evaluation.composite_score) * 16}px ${hexAlpha(
                          getCompositeAccentColor(
                            evaluation.composite_score,
                            mode
                          ),
                          0.28
                        )}`,
                      }
                    : {}),
                }}
                aria-label={`Composite score ${formatSigned(evaluation.composite_score)}`}
              >
                {formatSigned(evaluation.composite_score)}
              </span>
            </>
          ) : null}
        </div>
        {!isCompact ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-atlas-muted">
            {evaluation.specific_claim}
          </p>
        ) : null}
      </div>

      {isCompact ? (
        <section className="mt-6" aria-label="Evaluation summary">
          <EvaluationDetailCompact evaluation={evaluation} />
        </section>
      ) : (
        <>
          <section className="mt-8" aria-label="Composite score">
            <div className="rounded-atlas-card border border-atlas-border bg-atlas-deep/60 p-6 shadow-atlas-card sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-atlas-label">
                Composite score
              </p>
              <p
                className="mt-2 font-mono text-5xl font-black sm:text-6xl"
                style={{
                  color: getCompositeAccentColor(
                    evaluation.composite_score,
                    mode
                  ),
                  ...(mode === 'day'
                    ? { textShadow: 'none' }
                    : {
                        textShadow: `0 0 ${16 + getCompositePositiveRampT(evaluation.composite_score) * 26}px ${hexAlpha(
                          getCompositeAccentColor(
                            evaluation.composite_score,
                            mode
                          ),
                          0.26 +
                            getCompositePositiveRampT(
                              evaluation.composite_score
                            ) *
                              0.36
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
            <p className="text-sm text-atlas-muted">
              Truth (ETS) is the primary scale, rated out of 4. Engagement
              (SES) and Integration (EIS) are rated out of 3.
            </p>
            <ScoreTriptych evaluation={evaluation} />
          </section>

          <section className="mt-8">
            <EvaluationDetail evaluation={evaluation} />
          </section>
        </>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={randomNext}
          disabled={!canPickRandom}
          className="inline-flex items-center justify-center rounded-atlas-pill border border-atlas-border bg-atlas-deep/60 px-5 py-2.5 text-sm font-bold text-atlas-white shadow-atlas-card transition-colors hover:border-atlas-border-glow hover:bg-atlas-deep disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Open a random different theory evaluation"
          title={
            canPickRandom
              ? undefined
              : 'Only one evaluation is available in the feed'
          }
        >
          Random next theory
        </button>
        <button
          type="button"
          onClick={copyAsMarkdown}
          className="inline-flex items-center justify-center rounded-atlas-pill border border-atlas-border bg-atlas-deep/60 px-5 py-2.5 text-sm font-bold text-atlas-white shadow-atlas-card transition-colors hover:border-atlas-border-glow hover:bg-atlas-deep"
        >
          Copy as Markdown
        </button>
        <Link
          to="/#explorer"
          className="inline-flex items-center justify-center rounded-atlas-pill border border-atlas-border bg-atlas-deep/60 px-5 py-2.5 text-sm font-bold text-atlas-white shadow-atlas-card transition-colors hover:border-atlas-border-glow hover:bg-atlas-deep"
        >
          Back to Explorer
        </Link>
      </div>
    </main>
  );
}
