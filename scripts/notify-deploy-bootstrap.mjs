import path from 'path'
import { parseWipBullets } from './lib/changelog-wip.mjs'
import { readFileSync } from 'fs'
import {
  readState,
  stateKey,
  writePost,
  DEFAULT_STATE_PATH,
} from './lib/deploy-notify-state.mjs'
import { loadEnv, REPO_ROOT } from './lib/load-env.mjs'
import {
  resolveDeployTarget,
  resolveNotifyChannelKey,
} from './lib/deploy-notify.mjs'

loadEnv()

const changelogPath = path.join(REPO_ROOT, 'CHANGELOG.md')
const bullets = parseWipBullets(readFileSync(changelogPath, 'utf8'))

if (!bullets.length) {
  console.error('No # WIP bullets found in CHANGELOG.md')
  process.exit(1)
}

const deployTarget = resolveDeployTarget()
const channelKey = resolveNotifyChannelKey()
const key = stateKey(channelKey, deployTarget)
const state = readState()
const deployHost = process.env.DEPLOY_SSH_HOST?.trim() || 'bootstrap'

writePost(state, key, { lastPostedLine: bullets[0], deployHost })
console.log(
  `Marked current newest # WIP line as posted for ${key} (no Telegram message sent).`
)
console.log(bullets[0])
