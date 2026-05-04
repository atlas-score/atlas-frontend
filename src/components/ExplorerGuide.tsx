const summaryClass =
  'cursor-pointer list-none rounded-atlas-panel border border-atlas-border bg-atlas-mid/40 px-3 py-2 text-sm font-semibold text-atlas-bright-text outline-none transition-colors hover:border-atlas-border-glow hover:bg-atlas-mid [&::-webkit-details-marker]:hidden';

const bodyClass = 'mt-3 space-y-3 border-l-2 border-atlas-border pl-4 text-sm leading-relaxed text-atlas-muted';

export function ExplorerGuide() {
  return (
    <section
      className="rounded-atlas-card border border-atlas-border bg-atlas-deep/60 p-5 shadow-atlas-card sm:p-6"
      aria-labelledby="explorer-guide-title"
    >
      <h2
        id="explorer-guide-title"
        className="text-xs font-bold uppercase tracking-widest text-atlas-label"
      >
        Guide
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-atlas-muted">
        ATLAS scores are structured judgments about how a claim sits relative to
        evidence, scientific practice, and integration with established
        knowledge. This page is an interactive reader for the sample evaluations
        shipped in JSON form.
      </p>

      <div className="mt-5 space-y-3">
        <details className="group">
          <summary
            className={`${summaryClass} focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-deep`}
          >
            How to use this explorer
          </summary>
          <div className={bodyClass}>
            <ul className="list-disc space-y-2 pl-4">
              <li>
                <strong className="text-atlas-bright-text">Select evaluation</strong>{' '}
                opens the full list of frameworks in the feed. Choosing one
                updates the hero, triptych, and tabs on the right.
              </li>
              <li>
                <strong className="text-atlas-bright-text">Composite filter</strong>{' '}
                uses two handles on a single range. Only cards whose{' '}
                <em className="text-atlas-label">composite_score</em> falls
                between the handles stay in the sidebar list. The select still
                lists every record so you can jump directly to a theory that is
                outside the current band.
              </li>
              <li>
                <strong className="text-atlas-bright-text">Ontological scale tabs</strong>{' '}
                narrow the list to evaluations whose{' '}
                <em className="text-atlas-label">ontological_scales</em> array
                includes that band (Nano through Meta). “All” clears that
                constraint.
              </li>
              <li>
                <strong className="text-atlas-bright-text">Theory cards</strong>{' '}
                summarise SES, EIS, and ETS at a glance. Click a card to select
                it. Small badges open a popover with a one-line definition of
                each scale.
              </li>
              <li>
                <strong className="text-atlas-bright-text">Sub-score panels</strong>{' '}
                show the numeric value and label for each scale; hover or
                keyboard-focus a panel to read the evaluator&apos;s full
                justification in a tooltip.
              </li>
              <li>
                <strong className="text-atlas-bright-text">Detail tabs</strong>{' '}
                organise long text: narrative overview, transparent scoring
                breakdown, and optional triggered analysis blocks when the JSON
                includes them.
              </li>
            </ul>
          </div>
        </details>

        <details className="group">
          <summary
            className={`${summaryClass} focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-deep`}
          >
            What ETS, SES, and EIS mean
          </summary>
          <div className={bodyClass}>
            <p>
              <strong className="text-atlas-bright-text">ETS (Established Truth)</strong>{' '}
              is the primary axis: how well the central claim is supported by
              convergent evidence, from debunked (−1) through indeterminate (0),
              emerging support (1–2), proven phenomenon (3), to complete
              mechanistic closure (4). Override rules in the feed can anchor the
              composite when ETS hits extremes.
            </p>
            <p>
              <strong className="text-atlas-bright-text">SES (Scientific Engagement)</strong>{' '}
              describes methodological posture—whether the idea is tested,
              revised under evidence, and embedded in research programs (−2 to
              +3). It is not a substitute for truth: a debunked claim can still
              have been seriously investigated historically.
            </p>
            <p>
              <strong className="text-atlas-bright-text">EIS (Explanatory Integration)</strong>{' '}
              measures how the framework fits with broader established knowledge
              (−2 systemically incompatible through +3 architectonic
              integrator).
            </p>
            <p>
              The <strong className="text-atlas-bright-text">composite</strong>{' '}
              combines the three scales with documented rules (standard sum,
              negative override when ETS = −1, closure override when ETS = 4).
              See the <em className="text-atlas-label">Scoring</em> tab for the
              exact rule text on each record.
            </p>
          </div>
        </details>

        <details className="group">
          <summary
            className={`${summaryClass} focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-deep`}
          >
            Where documentation lives
          </summary>
          <div className={bodyClass}>
            <p>
              <strong className="text-atlas-bright-text">README.md</strong> in
              the repository root covers installation, scripts, and folder
              layout.
            </p>
            <p>
              <strong className="text-atlas-bright-text">generalInfo.md</strong>{' '}
              explains how this frontend was assembled from{' '}
              <code className="rounded bg-atlas-mid px-1 font-mono text-xs text-atlas-label">
                design.md
              </code>
              , the JSON schema, and the example feed—useful for audits and
              handoffs.
            </p>
            <p>
              Visual and interaction rules for the product skin remain canonical
              in{' '}
              <code className="rounded bg-atlas-mid px-1 font-mono text-xs text-atlas-label">
                design.md
              </code>
              .
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
