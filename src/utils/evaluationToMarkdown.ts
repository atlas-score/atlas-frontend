import type { AtlasEvaluation } from '../types/evaluation';
import { formatSigned } from './scoreColor';

function mdEscapeInline(s: string): string {
  // -- Minimal escaping for Markdown inline contexts.
  return s.replace(/([*_`])/g, '\\$1');
}

function mdBlock(s: string): string {
  return String(s ?? '').trim();
}

function joinLines(lines: Array<string | null | undefined>): string {
  return lines.filter((x): x is string => Boolean(x && x.trim() !== '')).join('\n');
}

function formatList(items: string[]): string {
  return items.map((x) => `- ${mdEscapeInline(x)}`).join('\n');
}

export function evaluationToMarkdown(e: AtlasEvaluation): string {
  const title = `${e.framework_name} [${formatSigned(e.composite_score)}]`;

  const analysisEntries = Object.entries(e.additional_analysis).filter(
    ([, v]) => v != null && String(v).trim() !== ''
  ) as [string, string][];

  const additionalAnalysis =
    analysisEntries.length === 0
      ? ''
      : joinLines([
          '## Triggered notes',
          ...analysisEntries.map(([k, v]) =>
            joinLines([
              `### ${mdEscapeInline(k)}`,
              mdBlock(v),
              '',
            ])
          ),
        ]);

  const md = joinLines([
    `# ${mdEscapeInline(title)}`,
    '',
    '## Summary',
    `- **Framework status**: ${mdEscapeInline(e.framework_status)}`,
    `- **Claim type**: ${mdEscapeInline(e.claim_type)}`,
    `- **Composite score**: **${formatSigned(e.composite_score)}**`,
    '',
    '## Specific claim evaluated',
    mdBlock(e.specific_claim),
    '',
    '## Framework description',
    mdBlock(e.framework_description),
    '',
    '## Context of validity',
    mdBlock(e.context_of_validity),
    '',
    '## Domains of inquiry',
    formatList(e.domains_of_inquiry),
    '',
    '## Ontological scales',
    formatList(e.ontological_scales.map(String)),
    '',
    '## Base scores',
    `- **Truth (ETS)**: ${formatSigned(e.ets.score)} — ${mdEscapeInline(e.ets.label)}${
      e.ets.closure_status ? ` (Closure: ${mdEscapeInline(e.ets.closure_status)})` : ''
    }`,
    `- **Engagement (SES)**: ${formatSigned(e.ses.score)} — ${mdEscapeInline(e.ses.label)}`,
    `- **Integration (EIS)**: ${formatSigned(e.eis.score)} — ${mdEscapeInline(e.eis.label)}`,
    '',
    '## Score calculation',
    `- **Raw ETS**: ${e.score_calculation.raw_ets}`,
    `- **Raw SES**: ${e.score_calculation.raw_ses}`,
    `- **Raw EIS**: ${e.score_calculation.raw_eis}`,
    `- **Rule applied**: ${mdEscapeInline(e.score_calculation.rule_applied)}`,
    `- **SES counted**: ${e.score_calculation.ses_counted === undefined ? '—' : e.score_calculation.ses_counted ? 'Yes' : 'No'}`,
    `- **EIS counted**: ${e.score_calculation.eis_counted === undefined ? '—' : e.score_calculation.eis_counted ? 'Yes' : 'No'}`,
    `- **Final score**: ${formatSigned(e.score_calculation.final_score)}`,
    '',
    '## Override status',
    `- **Negative override applied**: ${e.override_status.negative_override_applied ? 'Yes' : 'No'}`,
    `- **Closure override applied**: ${e.override_status.closure_override_applied ? 'Yes' : 'No'}`,
    '',
    '## Interpretation',
    mdBlock(e.interpretation),
    '',
    '## Justifications',
    '',
    '### Established Truth Scale (ETS)',
    mdBlock(e.ets.justification),
    '',
    '### Scientific Engagement Scale (SES)',
    mdBlock(e.ses.justification),
    '',
    '### Explanatory Integration Scale (EIS)',
    mdBlock(e.eis.justification),
    '',
    additionalAnalysis,
    '',
    '---',
    `Exported from ATLAS: ${mdEscapeInline(e.id)}`,
  ]);

  return md.trim() + '\n';
}

