import path from 'path'
import { getNewWipBulletsFromFile } from './changelog-wip.mjs'
import {
  readState,
  stateKey,
  writePost,
  DEFAULT_STATE_PATH,
} from './deploy-notify-state.mjs'
import { loadEnv, REPO_ROOT } from './load-env.mjs'
import {
  formatDeployNotifyMessages,
  isTelegramNotifyEnabled,
  resolveTelegramConfig,
  sendTelegramMessages,
} from './telegram-notify.mjs'

/** @returns {import('./deploy-notify-state.mjs').DeployTarget} */
export function resolveDeployTarget() {
  const raw = (process.env.DEPLOY_TARGET || 'production').trim().toLowerCase()
  if (raw === 'staging' || raw === 'stage') return 'staging'
  return 'production'
}

/** @returns {string} */
export function resolveNotifyChannelKey() {
  return (process.env.TELEGRAM_NOTIFY_CHANNEL_KEY || 'development').trim() || 'development'
}

/**
 * @param {{
 *   deployHost?: string
 *   dryRun?: boolean
 *   changelogPath?: string
 *   statePath?: string
 * }} [opts]
 */
export async function notifyDeployChangelog(opts = {}) {
  loadEnv()

  if (!isTelegramNotifyEnabled()) {
    console.log('Telegram deploy notify skipped (TELEGRAM_BOT_HTTP_API_TOKEN not set).')
    return { skipped: true, reason: 'disabled' }
  }

  const config = resolveTelegramConfig()
  if (!config?.token) {
    console.log('Telegram deploy notify skipped (no bot token).')
    return { skipped: true, reason: 'no-token' }
  }

  if (!config.chatId) {
    const channel = process.env.TELEGRAM_BOT_ATLAS_FRAMEWORK_DEVELOPMENT_NOTIFICATIONS_CHANNEL?.trim()
    console.warn(
      'Telegram deploy notify skipped: could not resolve chat_id. Private invite links (t.me/+…) need TELEGRAM_DEPLOY_CHAT_ID (numeric channel id). Public channels can use @channelname in TELEGRAM_BOT_ATLAS_FRAMEWORK_DEVELOPMENT_NOTIFICATIONS_CHANNEL.'
    )
    if (channel?.includes('t.me/+')) {
      console.warn(
        'Add the bot as a channel admin, then set TELEGRAM_DEPLOY_CHAT_ID (e.g. from @RawDataBot or getUpdates).'
      )
    }
    return { skipped: true, reason: 'no-chat-id' }
  }

  const deployTarget = resolveDeployTarget()
  const channelKey = resolveNotifyChannelKey()
  const key = stateKey(channelKey, deployTarget)
  const statePath = opts.statePath ?? DEFAULT_STATE_PATH
  const changelogPath = opts.changelogPath ?? path.join(REPO_ROOT, 'CHANGELOG.md')
  const deployHost =
    opts.deployHost ||
    process.env.DEPLOY_SSH_HOST?.trim() ||
    process.env.S3_BUCKET?.trim() ||
    'atlas-frontend'

  const state = readState(statePath)
  const lastPostedLine = state.posts[key]?.lastPostedLine
  const newBullets = getNewWipBulletsFromFile(changelogPath, lastPostedLine)

  if (newBullets.length === 0) {
    console.log(`Telegram deploy notify: no new # WIP lines for ${key}.`)
    return { skipped: true, reason: 'nothing-new', key }
  }

  const messages = formatDeployNotifyMessages({
    deployTarget,
    deployHost,
    newBullets,
  })

  const dryRun = Boolean(opts.dryRun)
  console.log(
    dryRun
      ? `[dry-run] Would post ${newBullets.length} changelog line(s) to Telegram (${key}).`
      : `Posting ${newBullets.length} new # WIP changelog line(s) to Telegram (${key})…`
  )

  await sendTelegramMessages({
    token: config.token,
    chatId: config.chatId,
    chunks: messages,
    dryRun,
  })

  if (!dryRun) {
    writePost(
      state,
      key,
      { lastPostedLine: newBullets[0], deployHost },
      statePath
    )
    console.log(`Updated deploy notify state: ${statePath}`)
  }

  return {
    skipped: false,
    key,
    postedCount: newBullets.length,
    newestLine: newBullets[0],
    dryRun,
  }
}
