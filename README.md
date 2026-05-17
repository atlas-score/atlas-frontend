# ATLAS Frontend — Score Explorer

Static **React** site for browsing **ATLAS** (Analytical Theory Legitimacy Assessment System) evaluation records: pick a framework, inspect **ETS**, **SES**, and **EIS** sub-scores, the **composite**, ontological scales, and narrative fields from the bundled JSON examples.

Visual design follows `**design.md`** (dark cosmic palette, typography, triptych layout). Styling uses **Tailwind CSS**; accessible controls use **Radix UI**.

## License and naming

- **License (legal text)**: see [`LICENSE.md`](LICENSE.md) (GitHub: `https://github.com/atlas-score/atlas-frontend/blob/master/LICENSE.md`).
- **License (plain English, not legally binding)**: see [`LICENSE-AI-Summary.md`](LICENSE-AI-Summary.md).

Note: this project is **source-available** (not OSI open source). The license includes commercial-use limits (revenue/cost-savings cap) and restrictions on presenting modified forks as official “ATLAS” scoring.

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually [http://localhost:5173/](http://localhost:5173/)).

## Scripts


| Command            | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| `npm run dev`      | Development server with hot reload                      |
| `npm run build`    | Production bundle to `dist/`                            |
| `npm run preview`  | Local static preview of `dist/`                         |
| `npm run deploy`   | Build + deploy to NGINX host via SSH/rsync              |
| `npm run deployS3` | Build + upload to S3 with cache headers + stale cleanup |


`vite.config.ts` sets `base: './'` so the built site can be served from a subdirectory or opened via paths that are not domain-root-relative.

## Repository layout


| Path                           | Role                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `design.md`                    | ATLAS design system: colours, components, Radix mapping |
| `atlas-evaluation-schema.json` | JSON Schema for one evaluation record                   |
| `atlas-score-examples.json`    | Feed: `examples[]` of full evaluations                  |
| `tailwind.config.js`           | Tailwind theme extension (`atlas-*` tokens)             |
| `src/App.tsx`                  | Page layout, filters, selection state                   |
| `src/components/`              | UI pieces (header, triptych, cards, Radix wrappers)     |
| `src/types/evaluation.ts`      | TypeScript shapes aligned with the schema               |
| `src/utils/scoreColor.ts`      | ETS pill classes, composite bar width helper            |
| `public/ATLAS-Tree-coloured-transparent.webp` | Header mark (square, transparent)      |
| `LICENSE.md`                   | License terms (legal text)                              |
| `LICENSE-AI-Summary.md`        | Plain-English license summary (not legally binding)     |
| `generalInfo.md`               | Long-form notes on how this frontend was built          |
| `docs/deploy.md`               | S3 deploy process and cache-control policy              |
| `.env.sample`                  | Deploy environment variable template                    |


## Data and schema

- **Runtime data** comes from importing `atlas-score-examples.json` in `App.tsx` (bundled at compile time). To ship new examples, edit that file or replace it and rebuild.
- **Validation** of records is not enforced at runtime; types in `src/types/evaluation.ts` mirror `atlas-evaluation-schema.json` for editor checking and documentation. Use a JSON Schema validator in CI if you need strict checks.

## Understanding the UI (short)

- **Select** — Jump to any evaluation by name (full list).
- **Composite slider** — Two thumbs set the allowed composite range; the card list only shows evaluations inside that band.
- **Ontological scale tabs** — Restrict the list to theories tagged with that scale (Nano … Meta). “All” clears the scale filter.
- **Cards** — Click a card to select; the right column shows the full detail. Badges open **popovers** with one-line scale definitions; triptych panels show full **justifications** in **tooltips**.
- **Tabs** (Overview / Scoring / Triggered notes) — Long-form text, calculation breakdown, and non-null `additional_analysis` blocks.

For a longer in-browser guide, expand the **Guide** panel (`ExplorerGuide` under the page title): how to use filters, what ETS/SES/EIS mean, and where repo docs live. For how the project was assembled from the design spec, see `**generalInfo.md`**.

## Deploy via SSH/rsync

Default deploy target:

- host: `atlasscore.org`
- user: `atlasdeploy`
- remote path: `/ATLAS`

Run:

```bash
npm run deploy
```

Optional overrides:

- `DEPLOY_SSH_USER`
- `DEPLOY_SSH_HOST`
- `DEPLOY_REMOTE_DIR`

Example:

```bash
DEPLOY_SSH_HOST=54.169.49.54 npm run deploy
```

For Windows setups, run this command from WSL if your SSH keys/config are managed there.



Example SSH ~/.ssh/config file entry:



```
Host atlasscore.org
    User atlasdeploy
    IdentityFile ~/.ssh/atlasdeploy.pem
    IdentitiesOnly yes
```

## Deploy to S3 (legacy / scale-up path)

1. Copy `.env.sample` to `.env` and fill AWS + bucket values.
2. Run:

```bash
npm run deployS3
```

Deploy behavior:

- runs `npm run build` (includes sourcemaps),
- uploads assets first with long cache, images with 24h cache, `index.html` with 2s TTL,
- waits 2 seconds, then deletes stale S3 objects not present in `dist/`.

Full deploy details are in `**docs/deploy.md**`.

## Licence

Add a licence file if you distribute this repository; none is implied by this README.