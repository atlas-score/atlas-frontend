import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { REPO_ROOT } from './load-env.mjs'

export const STATE_VERSION = 1
export const DEFAULT_STATE_PATH = path.join(REPO_ROOT, 'scripts', 'deploy-notify-state.json')

/**
 * @typedef {'production' | 'staging'} DeployTarget
 */

/**
 * @typedef {{
 *   version: number
 *   posts: Record<string, {
 *     lastPostedLine: string
 *     lastPostedAt: string
 *     deployHost?: string
 *   }>
 * }} DeployNotifyState
 */

/** @param {DeployTarget} target @param {string} channelKey */
export function stateKey(channelKey, target) {
  return `${channelKey}:${target}`
}

/** @param {string} [statePath] @returns {DeployNotifyState} */
export function readState(statePath = DEFAULT_STATE_PATH) {
  try {
    const raw = JSON.parse(readFileSync(statePath, 'utf8'))
    if (raw?.version === STATE_VERSION && raw.posts && typeof raw.posts === 'object') {
      return raw
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  return { version: STATE_VERSION, posts: {} }
}

/**
 * @param {DeployNotifyState} state
 * @param {string} key
 * @param {{ lastPostedLine: string, deployHost?: string }} entry
 * @param {string} [statePath]
 */
export function writePost(state, key, entry, statePath = DEFAULT_STATE_PATH) {
  state.posts[key] = {
    lastPostedLine: entry.lastPostedLine,
    lastPostedAt: new Date().toISOString(),
    ...(entry.deployHost ? { deployHost: entry.deployHost } : {}),
  }
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}
