import { spawn } from 'child_process'
import { createHash } from 'crypto'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const WAIT_BEFORE_DELETE_MS = 2000

function loadEnv() {
  const envPath = path.join(ROOT, '.env')
  try {
    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
}

const IMAGE_EXTENSIONS = new Set([
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
])

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return CONTENT_TYPES[ext] || 'application/octet-stream'
}

function getCacheControl(key) {
  const ext = path.extname(key).toLowerCase()
  if (key === 'index.html') {
    return 'public, max-age=2, s-maxage=2, must-revalidate'
  }
  if (ext === '.js' || ext === '.css' || ext === '.map') {
    return 'public, max-age=31536000, s-maxage=31536000, immutable'
  }
  if (IMAGE_EXTENSIONS.has(ext)) {
    return 'public, max-age=86400, s-maxage=86400'
  }
  return 'public, max-age=86400, s-maxage=86400'
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

function listLocalFiles(dir, base = dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listLocalFiles(full, base))
      continue
    }
    files.push(path.relative(base, full).replace(/\\/g, '/'))
  }
  return files
}

function md5Hex(buffer) {
  return createHash('md5').update(buffer).digest('hex')
}

async function listBucketObjects(client, bucket, prefix = '') {
  const keys = []
  const etagByKey = new Map()
  let continuationToken
  do {
    const out = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ...(continuationToken && { ContinuationToken: continuationToken }),
      })
    )
    for (const item of out.Contents || []) {
      if (!item.Key) continue
      keys.push(item.Key)
      if (item.ETag) {
        etagByKey.set(item.Key, item.ETag.replace(/^"|"$/g, ''))
      }
    }
    continuationToken = out.NextContinuationToken
  } while (continuationToken)
  return { keys, etagByKey }
}

async function uploadObject(client, bucket, key, body) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: getContentType(key),
      CacheControl: getCacheControl(key),
    })
  )
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function deleteObjects(client, bucket, keys) {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000)
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    )
  }
}

async function main() {
  loadEnv()

  const bucket = requiredEnv('S3_BUCKET')
  const region = process.env.AWS_REGION || 'us-east-1'
  const prefix = (process.env.S3_PREFIX || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
  const prefixWithSlash = prefix ? `${prefix}/` : ''

  console.log('Building project...')
  await runBuild()

  const localFiles = listLocalFiles(DIST)
  if (!localFiles.length) {
    throw new Error('No files found in dist/.')
  }

  const client = new S3Client({ region })
  const { keys: remoteKeys, etagByKey } = await listBucketObjects(
    client,
    bucket,
    prefixWithSlash
  )

  const indexKey = 'index.html'
  const nonIndexFiles = localFiles.filter((k) => k !== indexKey)
  const uploadOrder = [...nonIndexFiles]
  if (localFiles.includes(indexKey)) {
    uploadOrder.push(indexKey)
  }

  let uploaded = 0
  let skipped = 0
  console.log(
    `Syncing ${uploadOrder.length} local file(s) to s3://${bucket}/${prefixWithSlash}...`
  )

  for (const relativeKey of uploadOrder) {
    const absolutePath = path.join(DIST, relativeKey.replace(/\//g, path.sep))
    const body = readFileSync(absolutePath)
    const localMd5 = md5Hex(body)
    const remoteKey = `${prefixWithSlash}${relativeKey}`
    const remoteEtag = etagByKey.get(remoteKey)

    if (remoteEtag && remoteEtag === localMd5) {
      console.log(`  skip  ${relativeKey}`)
      skipped++
      continue
    }

    await uploadObject(client, bucket, remoteKey, body)
    console.log(`  upload ${relativeKey} [${getCacheControl(relativeKey)}]`)
    uploaded++
  }

  console.log(`Uploaded ${uploaded}, skipped ${skipped} unchanged.`)

  const desiredRemoteKeys = new Set(
    localFiles.map((key) => `${prefixWithSlash}${key}`)
  )
  const staleRemoteKeys = remoteKeys.filter((key) => !desiredRemoteKeys.has(key))

  if (staleRemoteKeys.length) {
    console.log(
      `Waiting ${WAIT_BEFORE_DELETE_MS}ms before deleting ${staleRemoteKeys.length} stale object(s)...`
    )
    await sleep(WAIT_BEFORE_DELETE_MS)
    await deleteObjects(client, bucket, staleRemoteKeys)
    console.log(`Deleted ${staleRemoteKeys.length} stale object(s).`)
  } else {
    console.log('No stale objects to delete.')
  }

  console.log('Deploy complete.')
}

main().catch((error) => {
  console.error('Deploy failed:', error.message)
  process.exit(1)
})
