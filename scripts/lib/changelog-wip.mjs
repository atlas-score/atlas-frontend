import { readFileSync } from 'fs'

const WIP_HEADING = '# WIP'
const BULLET_PREFIX = '* '

/**
 * @param {string} changelogText
 * @returns {string[]}
 */
export function parseWipBullets(changelogText) {
  const lines = changelogText.split(/\r?\n/)
  let inWip = false
  /** @type {string[]} */
  const bullets = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      if (trimmed === WIP_HEADING) {
        inWip = true
        continue
      }
      if (inWip) break
      continue
    }
    if (!inWip) continue
    if (trimmed.startsWith(BULLET_PREFIX)) {
      bullets.push(trimmed)
    }
  }

  return bullets
}

/**
 * WIP bullets are newest-first. Returns bullets not yet posted (above lastPostedLine).
 *
 * @param {string[]} wipBullets
 * @param {string | null | undefined} lastPostedLine
 * @returns {string[]}
 */
export function getNewWipBullets(wipBullets, lastPostedLine) {
  if (!lastPostedLine?.trim()) return [...wipBullets]
  const idx = wipBullets.indexOf(lastPostedLine.trim())
  if (idx === -1) return [...wipBullets]
  return wipBullets.slice(0, idx)
}

/**
 * @param {string} changelogPath
 * @param {string | null | undefined} lastPostedLine
 */
export function getNewWipBulletsFromFile(changelogPath, lastPostedLine) {
  const text = readFileSync(changelogPath, 'utf8')
  return getNewWipBullets(parseWipBullets(text), lastPostedLine)
}
