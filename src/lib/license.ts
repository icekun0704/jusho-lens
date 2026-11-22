/**
 * Offline Pro licence. A licence is `base64url(payload).base64url(signature)`
 * signed with Ed25519; the app verifies it with the public key below, so no
 * server is needed and no input leaves the browser.
 *
 * Issue one with: node tools/issue-license.mjs you@example.com
 */
const PUBLIC_KEY_B64 = 'J6-1Nqzb1j770y08DvUSW7-ABuHKuJ_tvhvjKVFJ7lo'
const STORAGE_KEY = 'jusho-lens-license'

export interface LicenseInfo {
  tier: 'pro'
  email?: string
  issued?: string
}

function b64urlToBuffer(value: string): ArrayBuffer {
  const s = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = s + '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(padded)
  const buffer = new ArrayBuffer(bin.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i)
  return buffer
}

export async function verifyLicense(token: string): Promise<LicenseInfo | null> {
  const trimmed = token.trim()
  const [payloadPart, signaturePart] = trimmed.split('.')
  if (!payloadPart || !signaturePart) return null
  try {
    const payload = b64urlToBuffer(payloadPart)
    const signature = b64urlToBuffer(signaturePart)
    const key = await crypto.subtle.importKey(
      'raw',
      b64urlToBuffer(PUBLIC_KEY_B64),
      { name: 'Ed25519' },
      false,
      ['verify'],
    )
    const ok = await crypto.subtle.verify('Ed25519', key, signature, payload)
    if (!ok) return null
    const json = JSON.parse(new TextDecoder().decode(payload)) as LicenseInfo & { v?: number }
    if (json.v !== 1 || json.tier !== 'pro') return null
    return { tier: 'pro', email: json.email, issued: json.issued }
  } catch {
    return null
  }
}

export function readStoredLicense(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function storeLicense(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    /* storage may be unavailable in private mode */
  }
}

export function clearLicense(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export async function loadLicense(): Promise<LicenseInfo | null> {
  const token = readStoredLicense()
  if (!token) return null
  return verifyLicense(token)
}
