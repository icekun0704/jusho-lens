/**
 * Builds the static address dictionary from Japan Post's KEN_ALL CSV and the
 * official KEN_ALL_ROME romanisation.
 *
 * Output:
 *   public/data/prefs.json        [[kanji, kana, romaji], ...]
 *   public/data/cities.json       [[pref, kanji, kana, romaji, ward|null, alt], ...]
 *   public/data/towns/<pref>.json [[city, kanji, kana, romaji, alt], ...]
 *   public/data/postal/<xx>.json  { "1234567": [pref, city, town, ...], ... }
 *
 * `alt` is Japan Post's official romanisation, lower-cased, used only as an
 * extra matching key: it keeps "Marunouchi" working even though the display
 * form collapses the long vowel to "Marunochi".
 */
import fs from 'node:fs'
import path from 'node:path'
import { kanaToRomaji } from '../src/lib/romaji.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const CSV = path.join(ROOT, 'data', 'utf_ken_all.csv')
const ROME = path.join(ROOT, 'data', 'ken_all_rome.csv')
const OUT = path.join(ROOT, 'public', 'data')

type Pref = [kanji: string, kana: string, romaji: string]
type City = [pref: number, kanji: string, kana: string, romaji: string, ward: string | null, alt: string]
type Town = [city: number, kanji: string, kana: string, romaji: string, alt: string]

const normKey = (s: string) => s.replace(/　/g, '').replace(/\s+/g, '').toLowerCase()
const normLoose = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

function stripSuffix(kana: string, suffixes: string[]): { stem: string; suffix: string } {
  for (const s of suffixes) {
    if (kana.endsWith(s)) return { stem: kana.slice(0, -s.length), suffix: s }
  }
  return { stem: kana, suffix: '' }
}

const DESIGNATED_CITIES: Record<string, string> = {
  札幌市: 'サッポロシ', 仙台市: 'センダイシ', さいたま市: 'サイタマシ', 千葉市: 'チバシ',
  横浜市: 'ヨコハマシ', 川崎市: 'カワサキシ', 相模原市: 'サガミハラシ', 新潟市: 'ニイガタシ',
  静岡市: 'シズオカシ', 浜松市: 'ハママツシ', 名古屋市: 'ナゴヤシ', 京都市: 'キョウトシ',
  大阪市: 'オオサカシ', 堺市: 'サカイシ', 神戸市: 'コウベシ', 岡山市: 'オカヤマシ',
  広島市: 'ヒロシマシ', 北九州市: 'キタキュウシュウシ', 福岡市: 'フクオカシ', 熊本市: 'クマモトシ',
}

function romanizeWard(kanji: string, kana: string): string {
  if (kanji.endsWith('区')) return `${kanaToRomaji(stripSuffix(kana, ['ク']).stem)}-ku`
  if (kanji.endsWith('市')) return kanaToRomaji(stripSuffix(kana, ['シ']).stem)
  if (kanji.endsWith('町')) {
    const { stem, suffix } = stripSuffix(kana, ['マチ', 'チョウ', 'チョー'])
    return `${kanaToRomaji(stem)}${suffix === 'マチ' ? '-machi' : '-cho'}`
  }
  if (kanji.endsWith('村')) {
    const { stem, suffix } = stripSuffix(kana, ['ムラ', 'ソン'])
    return `${kanaToRomaji(stem)}${suffix === 'ソン' ? '-son' : '-mura'}`
  }
  return kanaToRomaji(kana)
}

function romanizeAdmin(kanji: string, kana: string): { parts: string[]; ward: string | null } {
  if (kanji === '北海道') return { parts: ['hokkaido'], ward: null }

  if (kanji.endsWith('区')) {
    for (const [cityKanji, cityKana] of Object.entries(DESIGNATED_CITIES)) {
      if (kanji.startsWith(cityKanji) && kanji.length > cityKanji.length) {
        const wardKana = kana.startsWith(cityKana)
          ? kana.slice(cityKana.length).replace(/ク$/, '')
          : kana.slice(0, -1)
        return {
          parts: [kanaToRomaji(cityKana.replace(/シ$/, ''))],
          ward: `${kanaToRomaji(wardKana)}-ku`,
        }
      }
    }
  }

  if (kanji.endsWith('町') || kanji.endsWith('村')) {
    const gunKanji = kanji.slice(0, kanji.lastIndexOf('郡') + 1)
    if (kanji.includes('郡') && gunKanji.endsWith('郡')) {
      const gunKanaEnd = kana.indexOf('グン') + 2
      const gunKana = kana.slice(0, gunKanaEnd)
      const restKana = kana.slice(gunKanaEnd)
      const restKanji = kanji.slice(gunKanji.length)
      return {
        parts: [`${kanaToRomaji(stripSuffix(gunKana, ['グン']).stem)}-gun`, romanizeWard(restKanji, restKana)],
        ward: null,
      }
    }
  }

  if (kanji.endsWith('郡')) return { parts: [`${kanaToRomaji(stripSuffix(kana, ['グン']).stem)}-gun`], ward: null }
  if (kanji.endsWith('県')) return { parts: [kanaToRomaji(stripSuffix(kana, ['ケン']).stem)], ward: null }
  if (kanji.endsWith('府')) return { parts: [kanaToRomaji(stripSuffix(kana, ['フ']).stem)], ward: null }
  if (kanji.endsWith('都')) return { parts: [kanaToRomaji(stripSuffix(kana, ['ト']).stem)], ward: null }
  return { parts: [romanizeWard(kanji, kana)], ward: null }
}

const stripParen = (s: string) => s.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim()

function cleanTown(kanji: string, kana: string): { kanji: string; kana: string }[] {
  if (!kanji || kanji.includes('以下に掲載がない場合')) return []
  if (kanji.includes('、')) {
    const kParts = kanji.split('、')
    const nParts = kana.split('、')
    if (kParts.length === nParts.length) {
      return kParts
        .map((k, i) => ({ kanji: stripParen(k), kana: stripParen(nParts[i]) }))
        .filter((t) => t.kanji)
    }
  }
  return [{ kanji: stripParen(kanji), kana: stripParen(kana) }]
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else { quoted = false }
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

// Official romanisation (Shift-JIS).
const official = new Map<string, string>()        // pref|city|town -> town romaji
const officialCities = new Map<string, string>()  // pref|city -> city romaji
const romeText = fs.existsSync(ROME)
  ? new TextDecoder('shift_jis').decode(fs.readFileSync(ROME))
  : ''
if (romeText) {
  const romeRows = parseCsv(romeText)
  for (const r of romeRows) {
    if (r.length < 7) continue
    const pk = normKey(r[1])
    const ck = normKey(r[2])
    const tk = normKey(stripParen(r[3]))
    const townKey = `${pk}|${ck}|${tk}`
    if (!official.has(townKey)) {
      official.set(townKey, r[6].replace(/\([^)]*\)/g, '').trim().toLowerCase())
    }
    const cityKey = `${pk}|${ck}`
    if (!officialCities.has(cityKey)) officialCities.set(cityKey, r[5].trim().toLowerCase())
  }
  console.log('official romaji towns', official.size)
}

const raw = fs.readFileSync(CSV, 'utf-8').replace(/^﻿/, '')
const rows = parseCsv(raw)
if (rows[0].length < 15) throw new Error(`unexpected columns: ${rows[0].length}`)

const prefs: Pref[] = []
const prefIndex = new Map<string, number>()
const cities: City[] = []
const cityIndex = new Map<string, number>()
const townsByPref: Town[][] = []
const townIndex: Map<string, number>[] = []
const postal = new Map<string, number[]>()

function officialCity(cityKanji: string, prefKanji: string): string {
  const v = officialCities.get(`${normKey(prefKanji)}|${normKey(cityKanji)}`)
  return v ? v.split(/\s+/).filter((w) => w && w !== 'shi').join(' ') : ''
}

for (const r of rows.slice(1)) {
  if (r.length < 15) continue
  const [prefKana, cityKana, townKana] = [r[3], r[4], r[5]]
  const [prefKanji, cityKanji, townKanji] = [r[6], r[7], r[8]]
  const zip = r[2]
  if (!prefKanji || !cityKanji) continue

  let pi = prefIndex.get(prefKanji)
  if (pi === undefined) {
    pi = prefs.length
    prefIndex.set(prefKanji, pi)
    prefs.push([prefKanji, prefKana, romanizeAdmin(prefKanji, prefKana).parts.join(' ')])
    townsByPref.push([])
    townIndex.push(new Map())
  }

  const ckey = `${pi}|${cityKanji}`
  let ci = cityIndex.get(ckey)
  if (ci === undefined) {
    ci = cities.length
    cityIndex.set(ckey, ci)
    const a = romanizeAdmin(cityKanji, cityKana)
    const display = a.parts.join(' ')
    const alt = officialCity(cityKanji, prefKanji)
    cities.push([
      pi, cityKanji, cityKana, display, a.ward,
      alt && normLoose(alt) !== normLoose(`${display} ${a.ward ?? ''}`) ? alt : '',
    ])
  }

  for (const t of cleanTown(townKanji, townKana)) {
    const key = `${ci}|${t.kanji}`
    let ti = townIndex[pi].get(key)
    if (ti === undefined) {
      ti = townsByPref[pi].length
      townIndex[pi].set(key, ti)
      const display = kanaToRomaji(t.kana)
      const alt = official.get(`${normKey(prefKanji)}|${normKey(cityKanji)}|${normKey(t.kanji)}`) ?? ''
      townsByPref[pi].push([
        ci, t.kanji, t.kana, display,
        alt && normLoose(alt) !== normLoose(display) ? alt : '',
      ])
    }
    const list = postal.get(zip)
    if (!list) postal.set(zip, [pi, ci, ti])
    else {
      let dup = false
      for (let k = 0; k < list.length; k += 3) {
        if (list[k] === pi && list[k + 1] === ci && list[k + 2] === ti) { dup = true; break }
      }
      if (!dup) list.push(pi, ci, ti)
    }
  }
}

fs.mkdirSync(path.join(OUT, 'towns'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'postal'), { recursive: true })
fs.writeFileSync(path.join(OUT, 'prefs.json'), JSON.stringify(prefs))
fs.writeFileSync(path.join(OUT, 'cities.json'), JSON.stringify(cities))
townsByPref.forEach((towns, i) => {
  fs.writeFileSync(path.join(OUT, 'towns', `${i}.json`), JSON.stringify(towns))
})

const chunks = new Map<string, Record<string, number[]>>()
for (const [zip, flat] of postal) {
  const key = zip.slice(0, 2)
  let obj = chunks.get(key)
  if (!obj) { obj = {}; chunks.set(key, obj) }
  obj[zip] = flat
}
for (const [key, obj] of chunks) {
  fs.writeFileSync(path.join(OUT, 'postal', `${key}.json`), JSON.stringify(obj))
}

const meta = {
  builtAt: new Date().toISOString(),
  source: 'Japan Post KEN_ALL + KEN_ALL_ROME',
  prefectures: prefs.length,
  cities: cities.length,
  towns: townsByPref.reduce((a, t) => a + t.length, 0),
  postalCodes: postal.size,
  postalChunks: chunks.size,
  altTowns: townsByPref.reduce((a, t) => a + t.filter((x) => x[4]).length, 0),
}
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2))

const size = (p: string) => fs.statSync(p).size
const townSizes = townsByPref.map((_, i) => size(path.join(OUT, 'towns', `${i}.json`)))
console.log(meta)
console.log('cities', size(path.join(OUT, 'cities.json')), 'towns total', townSizes.reduce((a, b) => a + b, 0), 'max', Math.max(...townSizes))
