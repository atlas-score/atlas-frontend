import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import conceptualMarkdown from '../content/atlas-conceptual-breakdown.md?raw';
import { cn } from '../lib/cn';

const docComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="font-display text-3xl font-black tracking-tight text-atlas-white sm:text-[2rem] md:text-4xl"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-12 scroll-mt-24 border-b border-atlas-border pb-3 font-display text-xl font-bold tracking-tight text-atlas-bloom first:mt-0 sm:text-2xl"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-8 font-display text-lg font-bold text-atlas-bright-text sm:text-xl"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mt-6 text-base font-bold text-atlas-white" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mt-4 leading-relaxed text-atlas-muted first:mt-0" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-atlas-muted marker:text-atlas-vivid"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-atlas-muted marker:font-mono marker:text-atlas-label"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-atlas-bright-text" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="text-atlas-label italic" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mt-4 border-l-4 border-atlas-vivid/60 bg-atlas-deep/50 py-2 pl-4 pr-2 text-atlas-muted"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: ({ ...props }) => (
    <hr className="my-10 border-0 border-t border-atlas-border-dim" {...props} />
  ),
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      className="text-atlas-glow underline decoration-atlas-border underline-offset-4 transition-colors hover:text-atlas-bloom hover:decoration-atlas-bloom"
      {...props}
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isFenced = Boolean(className?.includes('language-'));
    if (isFenced) {
      return (
        <code className={cn('block font-mono text-sm', className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-atlas-mid/80 px-1.5 py-0.5 font-mono text-xs text-atlas-bright-text"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="mt-4 overflow-x-auto rounded-atlas-panel border border-atlas-border bg-atlas-deep p-4 font-mono text-xs text-atlas-bright-text shadow-atlas-card"
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-atlas-panel border border-atlas-border-dim shadow-atlas-card">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm text-atlas-muted" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="border-b border-atlas-border bg-atlas-mid/40 text-atlas-bright-text" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-atlas-border-dim" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="transition-colors hover:bg-atlas-deep/80" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2.5 align-top text-atlas-muted" {...props}>
      {children}
    </td>
  ),
};

export function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main
      id="about-atlas"
      className="mx-auto max-w-3xl px-4 py-10 pb-24 sm:px-6 lg:max-w-4xl"
    >
      <header className="border-b border-atlas-border pb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-atlas-label">
          About
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-atlas-muted">
          Conceptual overview of the ATLAS framework (summary). Links to read the
          full paper will appear here when available.
        </p>
        <p className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-atlas-pill border border-atlas-border px-4 py-2 text-sm font-semibold text-atlas-label transition-colors hover:border-atlas-border-glow hover:text-atlas-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void"
          >
            ← Back to explorer
          </Link>
        </p>
      </header>

      <article className="atlas-doc pt-10">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={docComponents}
        >
          {conceptualMarkdown}
        </ReactMarkdown>
      </article>

      <footer className="mt-16 border-t border-atlas-border pt-8 text-sm text-atlas-muted">
        <p className="max-w-2xl leading-relaxed">
          These summaries support understanding the framework; they are not a
          substitute for the full publication.
        </p>
      </footer>
    </main>
  );
}
