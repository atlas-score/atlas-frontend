import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from './lib/load-env.mjs'
import { notifyDeployChangelog } from './lib/deploy-notify.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const REMOTE_USER = process.env.DEPLOY_SSH_USER || 'atlasdeploy'
const REMOTE_HOST = process.env.DEPLOY_SSH_HOST || 'atlasscore.org'
const REMOTE_DIR = process.env.DEPLOY_REMOTE_DIR || '/ATLAS'
const REMOTE_TARGET = `${REMOTE_USER}@${REMOTE_HOST}`

// -- Quote argv pieces so logged commands are safe to read/copy when paths contain spaces.
function quoteArg(arg) {
  const s = String(arg)
  if (/[\s"'\\$`!]/.test(s)) return JSON.stringify(s)
  return s
}

function formatSpawnArgv(command, args) {
  return [command, ...args].map(quoteArg).join(' ')
}

function logAboutToRun(line) {
  console.log(`About to run: ${line}`)
}

// -- Windows Node (even when launched from a WSL shell) has no rsync on PATH; call WSL instead.
function toWslPath(p) {
  const abs = path.resolve(p)
  const forward = abs.replace(/\\/g, '/')
  if (forward.startsWith('/')) {
    return forward.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  }
  const m = /^([a-zA-Z]):\/?(.*)$/.exec(forward)
  if (m) {
    const rest = m[2] || ''
    const base = `/mnt/${m[1].toLowerCase()}/${rest}`
    return base.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  }
  return forward
}

function getRsyncSpawn(localDistDir) {
  const dest = `${REMOTE_TARGET}:${REMOTE_DIR.replace(/\/$/, '')}/`
  const rsyncInner = ['-az', '--delete']
  const custom = process.env.RSYNC_BIN?.trim()

  if (custom) {
    const src = `${path.resolve(localDistDir).replace(/\\/g, '/')}/`
    return {
      command: custom,
      args: [...rsyncInner, src, dest],
    }
  }

  if (process.platform === 'win32') {
    const src = `${toWslPath(localDistDir)}/`
    return {
      command: 'wsl',
      args: ['--', 'rsync', ...rsyncInner, src, dest],
    }
  }

  const src = `${path.resolve(localDistDir).replace(/\\/g, '/')}/`
  return {
    command: 'rsync',
    args: [...rsyncInner, src, dest],
  }
}

function runCommand(command, args, { shell = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: 'inherit',
      shell,
      env: process.env,
    })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code}`))
    })
    child.on('error', reject)
  })
}

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn('npm run build', [], {
      shell: true,
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Build exited with code ${code}`))
    })
    child.on('error', reject)
  })
}

async function main() {
  loadEnv()
  console.log('Building project...')
  logAboutToRun(`npm run build (cwd: ${quoteArg(ROOT)})`)
  await runBuild()

  console.log(
    `Syncing into existing remote directory (no mkdir): ${REMOTE_TARGET}:${REMOTE_DIR}`
  )
  const rsync = getRsyncSpawn(DIST)
  logAboutToRun(formatSpawnArgv(rsync.command, rsync.args))
  await runCommand(rsync.command, rsync.args)

  console.log('Deploy complete.')

  try {
    await notifyDeployChangelog({ deployHost: REMOTE_HOST })
  } catch (error) {
    console.warn('Telegram deploy notify failed (deploy succeeded):', error.message)
  }
}

main().catch((error) => {
  console.error('Deploy failed:', error.message)
  console.error(
    'Ensure rsync exists (e.g. sudo apt install rsync in WSL). If npm uses Windows Node, this script runs rsync via `wsl`; install OpenSSH/rsync inside that distro.'
  )
  console.error(
    'If you see Permission denied (publickey), ensure this process can use your keys (e.g. ssh-agent / IdentityFile in ~/.ssh/config); npm-run environments sometimes differ from an interactive shell.'
  )
  process.exit(1)
})
