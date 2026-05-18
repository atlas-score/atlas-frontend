const TELEGRAM_API = 'https://api.telegram.org'

/** @param {string} text */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function resolveTelegramChatId(raw) {
  const value = raw?.trim()
  if (!value) return null
  if (/^-?\d+$/.test(value)) return value
  if (value.startsWith('@')) return value
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 't.me' || host === 'telegram.me') {
      const segment = url.pathname.replace(/^\//, '').split('/')[0]
      if (!segment) return null
      if (segment.startsWith('+')) return null
      return `@${segment}`
    }
  } catch {
    // -- not a URL
  }
  if (/^[\w-]+$/i.test(value)) return `@${value}`
  return null
}

/**
 * @param {{ token: string, chatId: string, text: string, dryRun?: boolean }} opts
 */
export async function sendTelegramMessage({ token, chatId, text, dryRun = false }) {
  if (dryRun) {
    console.log('[telegram dry-run] chat_id:', chatId)
    console.log(text)
    return
  }

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.ok === false) {
    const detail = body.description || res.statusText || String(res.status)
    let hint = ''
    if (/chat not found/i.test(detail)) {
      const n = Number(chatId)
      if (Number.isFinite(n) && n > 0) {
        hint =
          ' TELEGRAM_DEPLOY_CHAT_ID looks like a user id; channels need a negative id (often -100…). Run: npm run telegram:discover-chat'
      } else {
        hint =
          ' Add the bot as a channel admin, then run: npm run telegram:discover-chat'
      }
    }
    throw new Error(`Telegram sendMessage failed: ${detail}${hint}`)
  }
}

const MAX_MESSAGE_LEN = 4000

/**
 * @param {string[]} chunks
 */
export async function sendTelegramMessages({ token, chatId, chunks, dryRun = false }) {
  for (const chunk of chunks) {
    await sendTelegramMessage({ token, chatId, text: chunk, dryRun })
  }
}

/**
 * @param {{
 *   deployTarget: import('./deploy-notify-state.mjs').DeployTarget
 *   deployHost: string
 *   newBullets: string[]
 * }} opts
 * @returns {string[]}
 */
export function formatDeployNotifyMessages({ deployTarget, deployHost, newBullets }) {
  const targetLabel = deployTarget === 'staging' ? 'staging' : 'production'
  const header = [
    `<b>ATLAS deploy → ${escapeHtml(targetLabel)}</b>`,
    escapeHtml(deployHost),
    '',
    `<b># WIP</b> (${newBullets.length} new)`,
  ].join('\n')

  /** @type {string[]} */
  const messages = []
  let current = header

  for (const bullet of newBullets) {
    const line = `• ${escapeHtml(bullet.replace(/^\*\s+/, ''))}`
    const next = current ? `${current}\n${line}` : line
    if (next.length > MAX_MESSAGE_LEN) {
      if (current) messages.push(current)
      current = line
    } else {
      current = next
    }
  }
  if (current) messages.push(current)
  return messages
}

/**
 * @returns {{ token: string, chatId: string } | null}
 */
export function resolveTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_HTTP_API_TOKEN?.trim()
  if (!token) return null

  const chatId =
    resolveTelegramChatId(process.env.TELEGRAM_DEPLOY_CHAT_ID) ||
    resolveTelegramChatId(
      process.env.TELEGRAM_BOT_ATLAS_FRAMEWORK_DEVELOPMENT_NOTIFICATIONS_CHANNEL
    )

  if (!chatId) return { token, chatId: '' }
  return { token, chatId }
}

/** @returns {boolean} */
export function isTelegramNotifyEnabled() {
  const flag = process.env.TELEGRAM_NOTIFY?.trim().toLowerCase()
  if (flag === '0' || flag === 'false' || flag === 'no') return false
  return Boolean(process.env.TELEGRAM_BOT_HTTP_API_TOKEN?.trim())
}
