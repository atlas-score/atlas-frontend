# Deployment to S3 (legacy path)

This project supports `npm run deployS3`, which:

1. builds the app (`vite build`, with sourcemaps enabled),
2. uploads files in `dist/` to S3 with explicit `Cache-Control`,
3. uploads non-`index.html` files first, then `index.html`,
4. waits 2 seconds,
5. deletes stale objects that are no longer in `dist/`.

The script is `scripts/deploy.mjs` and uses AWS SDK v3 (`@aws-sdk/client-s3`).

## Why this order matters

- JS/CSS bundles are content-hashed by Vite and can be cached for a long time.
- `index.html` references those bundles and must stay fresh.
- Uploading assets first, then `index.html`, avoids serving a new HTML shell that points to assets not uploaded yet.
- The 2-second wait before deletion reduces the chance of deleting just-referenced old files during the handoff window.

## Required environment variables

Create `.env` from `.env.sample`:

```bash
cp .env.sample .env
```

Set at least:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default in sample: `us-east-1`)
- `S3_BUCKET`

Optional:

- `AWS_SESSION_TOKEN` (for temporary credentials)
- `S3_PREFIX` (deploy to a folder inside bucket, e.g. `atlas/prod`)

The deploy script loads `.env` locally at runtime. These secrets are **not** included in the build output (`dist/`) unless you explicitly expose values through Vite env injection (not done here).

## Cache-Control policy used by deploy script

- `index.html`  
  `public, max-age=2, s-maxage=2, must-revalidate`

- `.js`, `.css`, `.map`  
  `public, max-age=31536000, s-maxage=31536000, immutable`

- images (`.svg`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.avif`, `.ico`)  
  `public, max-age=86400, s-maxage=86400`

- all other files (default)  
  `public, max-age=86400, s-maxage=86400`

## Sourcemaps

`vite.config.ts` sets:

```ts
build: { sourcemap: true }
```

So `.map` files are emitted and uploaded with long TTL.

## Run deployment

```bash
npm run deployS3
```

Current primary deployment for production is SSH/rsync via `npm run deploy`; use `deployS3` when deploying to S3.

## Telegram changelog notifications

After a successful `npm run deploy` or `npm run deployS3`, if `TELEGRAM_BOT_HTTP_API_TOKEN` is in `.env`, the deploy script posts any new `# WIP` bullets from `CHANGELOG.md` that have not been sent yet. Progress is stored in `scripts/deploy-notify-state.json` under keys like `development:production` or `development:staging` (`TELEGRAM_NOTIFY_CHANNEL_KEY` + `DEPLOY_TARGET`).

Private channel invite URLs (`https://t.me/+…`) cannot be used with the Bot API. Add the bot as a channel admin, obtain the numeric chat id (e.g. via @RawDataBot), and set `TELEGRAM_DEPLOY_CHAT_ID`. Public channels may use `@ChannelName` in `TELEGRAM_BOT_ATLAS_FRAMEWORK_DEVELOPMENT_NOTIFICATIONS_CHANNEL`.

Dry-run without deploying:

```bash
npm run notify:deploy:dry-run
```

Mark the current newest `# WIP` line as already posted (no Telegram message) before your first real notify:

```bash
npm run notify:deploy:bootstrap
```

The script compares local file MD5 to remote object ETag and skips unchanged uploads when possible.

## Notes for CloudFront users

If CloudFront sits in front of S3, ensure your cache policy allows origin headers to work as intended:

- set cache policy **Min TTL = 0**
- do not force a large default/min TTL that overrides S3 metadata

Optionally add a dedicated behavior for `/index.html` if you want stricter control over shell freshness.
