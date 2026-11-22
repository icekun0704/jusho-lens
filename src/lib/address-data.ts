/** Lazy loaders for the static dictionary built by tools/build-data.ts. */

export type PrefEntry = [kanji: string, kana: string, romaji: string]
export type CityEntry = [pref: number, kanji: string, kana: string, romaji: string, ward: string | null, alt: string]
export type TownEntry = [city: number, kanji: string, kana: string, romaji: string, alt: string]

const cache = new Map<string, Promise<unknown>>()

function load<T>(rel: string): Promise<T> {
  let p = cache.get(rel)
  if (!p) {
    const url = `${import.meta.env.BASE_URL}data/${rel}`
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`辞書データを読み込めませんでした (${rel}: ${r.status})`)
      return r.json() as Promise<T>
    })
    cache.set(rel, p)
    p.catch(() => cache.delete(rel))
  }
  return p as Promise<T>
}

export const loadPrefs = () => load<PrefEntry[]>('prefs.json')
export const loadCities = () => load<CityEntry[]>('cities.json')
export const loadTowns = (prefIndex: number) => load<TownEntry[]>(`towns/${prefIndex}.json`)
export const loadPostalChunk = (prefix: string) => load<Record<string, number[]>>(`postal/${prefix}.json`)
export const loadMeta = () =>
  load<{ builtAt: string; prefectures: number; cities: number; towns: number; postalCodes: number }>('meta.json')

export interface Dictionary {
  prefs: PrefEntry[]
  cities: CityEntry[]
}

let dictPromise: Promise<Dictionary> | null = null

export function loadDictionary(): Promise<Dictionary> {
  if (!dictPromise) {
    dictPromise = Promise.all([loadPrefs(), loadCities()]).then(([prefs, cities]) => ({ prefs, cities }))
    dictPromise.catch(() => { dictPromise = null })
  }
  return dictPromise
}
