/**
 * Issue a Pro licence key.
 *
 *   node tools/issue-license.mjs buyer@example.com
 *
 * The private key lives in secrets/license-private.pem and must never be
 * committed or shipped. Keep a backup; losing it means you cannot issue new
 * keys for the public key already embedded in the app.
 */
import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'

const email = process.argv[2]
if (!email) {
  console.error('usage: node tools/issue-license.mjs <email>')
  process.exit(1)
}

const keyPath = path.resolve(import.meta.dirname, '..', 'secrets', 'license-private.pem')
const privateKey = crypto.createPrivateKey(fs.readFileSync(keyPath, 'utf8'))

const payload = Buffer.from(
  JSON.stringify({ v: 1, tier: 'pro', email, issued: new Date().toISOString().slice(0, 10) }),
)
const signature = crypto.sign(null, payload, privateKey)

console.log(`${payload.toString('base64url')}.${signature.toString('base64url')}`)
