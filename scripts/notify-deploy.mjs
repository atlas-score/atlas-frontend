import { notifyDeployChangelog } from './lib/deploy-notify.mjs'

const dryRun = process.argv.includes('--dry-run')

notifyDeployChangelog({ dryRun }).catch((error) => {
  console.error('Deploy notify failed:', error.message)
  process.exit(1)
})
