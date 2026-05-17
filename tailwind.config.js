const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        atlas: {
          space: 'var(--color-atlas-space)',
          void: 'var(--color-atlas-void)',
          deep: 'var(--color-atlas-deep)',
          mid: 'var(--color-atlas-mid)',
          rich: 'var(--color-atlas-rich)',
          brand: 'var(--color-atlas-brand)',
          bright: 'var(--color-atlas-bright)',
          vivid: 'var(--color-atlas-vivid)',
          glow: 'var(--color-atlas-glow)',
          bloom: 'var(--color-atlas-bloom)',
          white: 'var(--color-atlas-white)',
          'bright-text': 'var(--color-atlas-bright-text)',
          muted: 'var(--color-atlas-muted)',
          label: 'var(--color-atlas-label)',
          dim: 'var(--color-atlas-dim)',
          border: 'var(--color-atlas-border)',
          'border-glow': 'var(--color-atlas-border-glow)',
          'border-dim': 'var(--color-atlas-border-dim)',
          'score-4': 'var(--color-atlas-score-4)',
          'score-3': 'var(--color-atlas-score-3)',
          'score-2': 'var(--color-atlas-score-2)',
          'score-1': 'var(--color-atlas-score-1)',
          'score-0': 'var(--color-atlas-score-0)',
          'score-neg1': 'var(--color-atlas-score-neg1)',
          debunked: 'var(--color-atlas-debunked)',
          'proven-pill': 'var(--color-atlas-proven-pill)',
          'grad-start': 'var(--color-atlas-grad-start)',
          'grad-mid': 'var(--color-atlas-grad-mid)',
          'grad-end': 'var(--color-atlas-grad-end)',
        },
      },
      backgroundImage: {
        'atlas-space': 'var(--img-atlas-space)',
        'atlas-card': 'var(--img-atlas-card)',
        'atlas-glow': 'var(--img-atlas-glow)',
        'atlas-panel': 'var(--img-atlas-panel)',
        'atlas-score-positive':
          'linear-gradient(135deg, var(--color-atlas-vivid), var(--color-atlas-score-2))',
        'atlas-score-negative':
          'linear-gradient(135deg, var(--color-atlas-score-neg1), var(--color-atlas-debunked))',
      },
      boxShadow: {
        'atlas-glow-sm': 'var(--shadow-atlas-glow-sm)',
        'atlas-glow-md': 'var(--shadow-atlas-glow-md)',
        'atlas-glow-lg': 'var(--shadow-atlas-glow-lg)',
        'atlas-bloom': 'var(--shadow-atlas-bloom)',
        'atlas-inset': 'var(--shadow-atlas-inset)',
        'atlas-card': 'var(--shadow-atlas-card)',
      },
      fontFamily: {
        display: ['"Arial Black"', 'Arial', 'sans-serif'],
        body: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'atlas-pill': '9999px',
        'atlas-card': '12px',
        'atlas-panel': '8px',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('day', 'html[data-theme="day"] &');
      addVariant('night', 'html[data-theme="night"] &');
    }),
  ],
};
