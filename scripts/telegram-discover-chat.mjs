import { loadEnv } from './lib/load-env.mjs'
import { resolveTelegramChatId } from './lib/telegram-notify.mjs'

loadEnv()

const token = process.env.TELEGRAM_BOT_HTTP_API_TOKEN?.trim()
if (!token) {
  console.error('Set TELEGRAM_BOT_HTTP_API_TOKEN in .env')
  process.exit(1)
}

const configured =
  resolveTelegramChatId(process.env.TELEGRAM_DEPLOY_CHAT_ID) ||
  resolveTelegramChatId(
    process.env.TELEGRAM_BOT_ATLAS_FRAMEWORK_DEVELOPMENT_NOTIFICATIONS_CHANNEL
  )

const api = (method, params = {}) => {
  const qs = new URLSearchParams(params)
  const url = `https://api.telegram.org/bot${token}/${method}${qs.size ? `?${qs}` : ''}`
  return fetch(url).then((r) => r.json())
}

async function probeChatId(chatId) {
  const res = await api('getChat', { chat_id: chatId })
  if (res.ok) {
    const c = res.result
    console.log(`getChat(${chatId}): OK — type=${c.type} title=${c.title ?? c.username ?? c.first_name}`)
    return true
  }
  console.log(`getChat(${chatId}): ${res.description ?? 'failed'}`)
  return false
}

async function main() {
  console.log('Configured chat_id:', configured ?? '(none)')

  if (configured) {
    const n = Number(configured)
    if (Number.isFinite(n) && n > 0) {
      console.warn(
        'Warning: positive numeric ids are usually Telegram *user* ids, not channels.\n' +
          'Channel/supergroup ids are negative (often -100…).'
      )
    }
    await probeChatId(configured)
  }

  console.log('\nRecent chats from getUpdates (post in the channel after adding the bot as admin):')
  const updates = await api('getUpdates', { limit: 100 })
  if (!updates.ok) {
    console.error(updates.description ?? 'getUpdates failed')
    process.exit(1)
  }

  if (!updates.result?.length) {
    console.log(
      '  (no updates yet)\n' +
        '  1. Add the bot to your channel as an administrator (can post messages).\n' +
        '  2. Send any message in the channel (or trigger a channel post).\n' +
        '  3. Run this script again.\n' +
        '  Or forward a channel post to @RawDataBot / @getidsbot to read the id.'
    )
    process.exit(0)
  }

  /** @type {Map<string, object>} */
  const chats = new Map()
  for (const u of updates.result) {
    const candidates = [
      u.message?.chat,
      u.channel_post?.chat,
      u.my_chat_member?.chat,
      u.chat_member?.chat,
    ].filter(Boolean)
    for (const chat of candidates) {
      chats.set(String(chat.id), chat)
    }
  }

  for (const chat of chats.values()) {
    const label = chat.title || chat.username || chat.first_name || '?'
    console.log(`  id=${chat.id}  type=${chat.type}  ${label}`)
    if (chat.type === 'channel' || chat.type === 'supergroup') {
      console.log(`    → set TELEGRAM_DEPLOY_CHAT_ID=${chat.id}`)
    }
  }
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
