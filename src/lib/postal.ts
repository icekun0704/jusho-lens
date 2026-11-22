import { loadPostalChunk, loadTowns, type Dictionary, type TownEntry } from './address-data'

export interface PostalHit {
  prefIndex: number
  cityIndex: number
  townIndex: number
  pref: string
  city: string
  town: string
  townRomaji: string
}

export function normalizePostal(input: string): string {
  return input.replace(/\D/g, '').slice(0, 7)
}

export function formatPostalInput(input: string): string {
  const d = normalizePostal(input)
  return d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d
}

const townCache = new Map<number, Promise<TownEntry[]>>()

function townsFor(prefIndex: number): Promise<TownEntry[]> {
  let p = townCache.get(prefIndex)
  if (!p) {
    p = loadTowns(prefIndex)
    townCache.set(prefIndex, p)
    p.catch(() => townCache.delete(prefIndex))
  }
  return p
}

/** Look a 7-digit postcode up in the static index. Returns every matching town. */
export async function lookupPostal(code: string, dict: Dictionary): Promise<PostalHit[]> {
  const digits = normalizePostal(code)
  if (digits.length !== 7) return []
  const chunk = await loadPostalChunk(digits.slice(0, 2))
  const flat = chunk[digits]
  if (!flat) return []

  const hits: PostalHit[] = []
  const seen = new Set<string>()
  for (let i = 0; i < flat.length; i += 3) {
    const pi = flat[i]
    const ci = flat[i + 1]
    const ti = flat[i + 2]
    const towns = await townsFor(pi)
    const t = towns[ti]
    const town = t ? t[1] : ''
    const key = `${ci}|${town}`
    if (seen.has(key)) continue
    seen.add(key)
    hits.push({
      prefIndex: pi,
      cityIndex: ci,
      townIndex: ti,
      pref: dict.prefs[pi][0],
      city: dict.cities[ci][1],
      town,
      townRomaji: t ? t[3] : '',
    })
  }
  return hits
}
