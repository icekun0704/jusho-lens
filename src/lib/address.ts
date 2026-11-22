import type { CityEntry, Dictionary, PrefEntry, TownEntry } from './address-data'
import { capFirst, kanaToRomaji, titleCaseRomaji } from './romaji'

export type AddressFormat = 'postal' | 'oneline' | 'oneline-uk' | 'twoline' | 'fields'

export interface ParsedAddress {
  postalCode: string
  prefIndex: number | null
  cityIndex: number | null
  townIndex: number | null
  pref: string
  city: string
  town: string
  block: string
  building: string
  buildingRomaji: string
  notes: string[]
  score: number
}

const KANJI_DIGITS: Record<string, number> = {
  〇: 0, 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
}

/** 二十三 → 23, 十 → 10, 三 → 3. Only used inside block numbers. */
export function kanjiNumberToArabic(input: string): string {
  return input.replace(/[〇零一二三四五六七八九十]+/g, (run) => {
    if (/^[〇零一二三四五六七八九]+$/.test(run)) {
      return run.split('').map((c) => String(KANJI_DIGITS[c] ?? '')).join('')
    }
    let total = 0
    let current = 0
    for (const ch of run) {
      if (ch === '十') {
        total += (current || 1) * 10
        current = 0
      } else {
        current = KANJI_DIGITS[ch] ?? 0
      }
    }
    return String(total + current)
  })
}

export function normalizeJapanese(input: string): string {
  return input
    .replace(/[０-９Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[－−—–―]/g, '-')
    .replace(/[　]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractPostalCode(input: string): { postalCode: string; rest: string } {
  const withMark = input.match(/〒\s*(\d{3})\s*-?\s*(\d{4})/)
  if (withMark) {
    return {
      postalCode: `${withMark[1]}${withMark[2]}`,
      rest: input.replace(withMark[0], ' ').trim(),
    }
  }
  const hyphenated = input.match(/(?:^|\s)(\d{3})-(\d{4})(?=\s|$)/)
  if (hyphenated) {
    return {
      postalCode: `${hyphenated[1]}${hyphenated[2]}`,
      rest: input.replace(hyphenated[0], ' ').trim(),
    }
  }
  const plain = input.match(/(?:^|\s)(\d{7})(?=\s|$)/)
  if (plain) {
    return { postalCode: plain[1], rest: input.replace(plain[0], ' ').trim() }
  }
  return { postalCode: '', rest: input }
}

function longestAt(input: string, candidates: { id: number; text: string }[], from: number) {
  let best: { pos: number; id: number; text: string } | null = null
  for (const c of candidates) {
    const at = input.indexOf(c.text, from)
    if (at === -1) continue
    if (!best || at < best.pos || (at === best.pos && c.text.length > best.text.length)) {
      best = { pos: at, id: c.id, text: c.text }
    }
  }
  return best
}

export function parseJapanese(
  rawInput: string,
  dict: Dictionary,
  towns: TownEntry[] | null,
): ParsedAddress {
  const notes: string[] = []
  const { postalCode, rest } = extractPostalCode(normalizeJapanese(rawInput))
  let work = rest
  let score = 0

  // Prefecture
  let prefIndex: number | null = null
  const prefCandidates = dict.prefs.map((p, i) => ({ id: i, text: p[0] }))
  const prefHit = longestAt(work, prefCandidates, 0)
  if (prefHit) {
    prefIndex = prefHit.id
    work = work.slice(prefHit.pos + prefHit.text.length)
    score += 40
  }

  // City
  let cityIndex: number | null = null
  const cityCandidates = dict.cities
    .map((c, i) => ({ id: i, text: c[1] }))
    .filter((c) => prefIndex === null || dict.cities[c.id][0] === prefIndex)
  const cityHit = longestAt(work, cityCandidates, 0)
  if (cityHit) {
    cityIndex = cityHit.id
    if (prefIndex === null) {
      prefIndex = dict.cities[cityIndex][0]
      score += 20
    }
    work = work.slice(cityHit.pos + cityHit.text.length)
    score += 30
  }

  // Town
  let townIndex: number | null = null
  if (towns && cityIndex !== null) {
    const candidates = towns
      .map((t, i) => ({ id: i, text: t[1] }))
      .filter((t) => towns[t.id][0] === cityIndex && t.text)
    const hit = longestAt(work, candidates, 0)
    if (hit) {
      townIndex = hit.id
      work = work.slice(hit.pos + hit.text.length)
      score += 20
    }
  }

  // Block numbers
  work = work.replace(/^[\s,、]+/, '')
  const { block, rest: afterBlock } = parseBlock(work)
  if (block) score += 10

  const building = afterBlock.replace(/^[\s,、]+/, '').trim()
  const buildingRomaji = romanizeBuilding(building)
  if (building && !buildingRomaji) notes.push('建物名に漢字が含まれています。ローマ字を入力してください。')
  if (prefIndex === null) notes.push('都道府県を特定できませんでした。')
  if (prefIndex !== null && cityIndex === null) notes.push('市区町村を特定できませんでした。')
  if (townIndex === null && cityIndex !== null) notes.push('町名を辞書で特定できませんでした。番地の入力を確認してください。')

  return {
    postalCode,
    prefIndex,
    cityIndex,
    townIndex,
    pref: prefIndex !== null ? dict.prefs[prefIndex][0] : '',
    city: cityIndex !== null ? dict.cities[cityIndex][1] : '',
    town: townIndex !== null && towns ? towns[townIndex][1] : '',
    block,
    building,
    buildingRomaji,
    notes,
    score,
  }
}

function parseBlock(input: string): { block: string; rest: string } {
  const s = kanjiNumberToArabic(input)
  // 1丁目2番3号 / 1丁目2-3 / 1丁目2番地
  let m = s.match(/^\s*(\d+)\s*丁目\s*(\d+)\s*(?:番地?)?\s*(?:-\s*(\d+))?\s*(?:号)?/)
  if (m) {
    const parts = [m[1], m[2], m[3]].filter((x) => x !== undefined) as string[]
    return { block: parts.join('-'), rest: s.slice(m[0].length) }
  }
  // 1-2-3 / 1-2
  m = s.match(/^\s*(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?/)
  if (m) {
    const parts = [m[1], m[2], m[3]].filter((x) => x !== undefined) as string[]
    return { block: parts.join('-'), rest: s.slice(m[0].length) }
  }
  // 12番地3 / 12番3号
  m = s.match(/^\s*(\d+)\s*番地?\s*(\d+)?\s*号?/)
  if (m) {
    const parts = [m[1], m[2]].filter((x) => x !== undefined) as string[]
    return { block: parts.join('-'), rest: s.slice(m[0].length) }
  }
  // 12番地
  m = s.match(/^\s*(\d+)\s*番地?/)
  if (m) return { block: m[1], rest: s.slice(m[0].length) }
  // 2丁目 (Hokkaido style: the block is the chome number alone)
  m = s.match(/^\s*(\d+)\s*丁目/)
  if (m) return { block: m[1], rest: s.slice(m[0].length) }
  // Bare lot number: 488, 2148
  m = s.match(/^\s*(\d+)/)
  if (m) return { block: m[1], rest: s.slice(m[0].length) }
  return { block: '', rest: input }
}

const BUILDING_WORDS: [RegExp, string][] = [
  [/ビルディング|ビル/g, 'Building'],
  [/マンション/g, 'Mansion'],
  [/ハイツ/g, 'Heights'],
  [/アパート/g, 'Apartment'],
  [/コーポ/g, 'Corp'],
  [/タワー/g, 'Tower'],
  [/プラザ/g, 'Plaza'],
  [/センタービル/g, 'Center Building'],
  [/会館/g, 'Kaikan'],
  [/館/g, 'Kan'],
  [/荘/g, 'So'],
]

export function romanizeBuilding(building: string): string {
  if (!building) return ''
  // Kana + ASCII can be romanised; kanji cannot be read reliably.
  if (/[一-鿿]/.test(building)) return ''
  let s = building
  for (const [re, word] of BUILDING_WORDS) s = s.replace(re, ` ${word} `)
  return titleCaseRomaji(kanaToRomaji(s).replace(/\s+/g, ' ').trim())
}

export interface RomajiPieces {
  postalCode: string
  pref: string
  cityParts: string[]
  ward: string
  town: string
  block: string
  building: string
}

export function toPieces(parsed: ParsedAddress, dict: Dictionary): RomajiPieces {
  const prefEntry: PrefEntry | undefined = parsed.prefIndex !== null ? dict.prefs[parsed.prefIndex] : undefined
  const cityEntry: CityEntry | undefined = parsed.cityIndex !== null ? dict.cities[parsed.cityIndex] : undefined
  const cityParts = cityEntry ? cityEntry[3].split(' ').filter(Boolean) : []
  return {
    postalCode: parsed.postalCode,
    pref: prefEntry ? prefEntry[2] : '',
    cityParts,
    ward: cityEntry?.[4] ?? '',
    town: '',
    block: parsed.block,
    building: parsed.buildingRomaji,
  }
}

export function postalHyphen(postal: string): string {
  return postal && postal.length === 7 ? `${postal.slice(0, 3)}-${postal.slice(3)}` : postal
}

/** "kita1jonishi" → "Kita 1-jo Nishi" (Sapporo's 条丁目 grid). */
export function formatTown(romaji: string): string {
  if (!romaji) return ''
  let s = romaji
  if (/\d/.test(s)) {
    s = s.replace(/([a-z]+)(\d+)/, '$1 $2')
    s = s.replace(/(\d+)jo/g, '$1-jo ')
    s = s.replace(/\s+/g, ' ').trim()
  }
  return s.split(' ').map(capFirst).join(' ')
}

export function formatRomaji(
  pieces: RomajiPieces,
  townRomaji: string,
  format: AddressFormat,
): string[] {
  const town = formatTown(townRomaji)
  const street = [pieces.block, town].filter(Boolean).join(' ')
  const locality = pieces.ward ? [pieces.ward, ...pieces.cityParts] : [...pieces.cityParts].reverse()
  const loc = locality.map(capFirst)
  // "Kita-ku, Osaka, Osaka" → drop the duplicated prefecture.
  const prefRaw = capFirst(pieces.pref)
  const pref = loc.some((l) => l.toLowerCase() === prefRaw.toLowerCase()) ? '' : prefRaw
  const postal = postalHyphen(pieces.postalCode)
  const building = pieces.building ? titleCaseRomaji(pieces.building) : ''

  if (format === 'postal') {
    const lines: string[] = []
    if (building) lines.push(building)
    if (street) lines.push(street)
    const admin = [[...loc, pref].filter(Boolean).join(', '), postal].filter(Boolean).join(' ')
    if (admin) lines.push(admin)
    lines.push('JAPAN')
    return lines
  }

  if (format === 'fields') {
    const addressLines = [street, building].filter(Boolean)
    const lines: string[] = []
    lines.push(`Address Line 1: ${addressLines[0] ?? ''}`)
    if (addressLines[1]) lines.push(`Address Line 2: ${addressLines[1]}`)
    lines.push(`City: ${loc[0] ?? ''}`)
    if (loc.length > 1) lines.push(`State / Province: ${loc.slice(1).join(', ')}`)
    if (pref) lines.push(`State / Province: ${pref}`)
    lines.push(`Postal Code: ${postal}`)
    lines.push('Country: Japan')
    return lines
  }

  if (format === 'twoline') {
    const first = [street, loc[0]].filter(Boolean).join(', ')
    const second = [...loc.slice(1), pref, postal, 'Japan'].filter(Boolean).join(', ')
    return [building, first, second].filter(Boolean)
  }
  if (format === 'oneline-uk') {
    const all = [building, street, ...loc, pref, postal, 'Japan'].filter(Boolean)
    return [all.join(', ')]
  }
  const all = [building, street, ...loc, `${pref} ${postal}`.trim(), 'Japan'].filter(Boolean)
  return [all.join(', ')]
}

/** English → Japanese, best effort, using the same dictionary. */
export interface ReverseResult {
  japanese: string
  postalCode: string
  prefIndex: number | null
  cityIndex: number | null
  townIndex: number | null
  pref: string
  city: string
  town: string
  block: string
  building: string
  notes: string[]
  score: number
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

export function reverseLookup(
  input: string,
  dict: Dictionary,
  towns: TownEntry[] | null,
): ReverseResult {
  const notes: string[] = []
  const text = input.replace(/\s+/g, ' ').trim()
  const postalMatch = text.match(/\b(\d{3})-?(\d{4})\b/)
  const postalCode = postalMatch ? `${postalMatch[1]}${postalMatch[2]}` : ''
  const body = postalCode ? text.replace(postalMatch![0], ' ') : text

  const segments = body
    .split(/[,、\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
  const words = segments
    .flatMap((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/))
    .filter(Boolean)
  const wordSet = new Set(words)
  const segNorms = segments.map(norm)

  // Prefecture: a whole word, so "Nakanoshima, Kita-ku" does not match Akita.
  let prefIndex: number | null = null
  for (let i = 0; i < dict.prefs.length; i++) {
    const r = dict.prefs[i][2]
    if (r && wordSet.has(r)) { prefIndex = i; break }
  }

  // City / ward: exact segment matches outrank word matches.
  // A segment that is just the prefecture name must not count as an exact city
  // match, or "Naha, Okinawa" resolves to Okinawa City.
  const prefRom = prefIndex !== null ? norm(dict.prefs[prefIndex][2]) : ''
  let cityIndex: number | null = null
  let cityScore = 0
  for (let i = 0; i < dict.cities.length; i++) {
    const c = dict.cities[i]
    if (prefIndex !== null && c[0] !== prefIndex) continue
    const rom = c[3] ? norm(c[3]) : ''
    const ward = c[4] ? norm(c[4]) : ''
    const alt = c[5] ? norm(c[5]) : ''
    let score = 0
    for (const n of segNorms) {
      const isPrefSeg = prefRom !== '' && n === prefRom
      if (!isPrefSeg && ward && n === ward) score = Math.max(score, 100 + ward.length)
      else if (!isPrefSeg && rom && n === rom) score = Math.max(score, 90 + rom.length)
      else if (!isPrefSeg && alt && n === alt) score = Math.max(score, 85 + alt.length)
      else if (ward && n.startsWith(ward)) score = Math.max(score, 40 + ward.length)
      else if (rom && n.startsWith(rom)) score = Math.max(score, 30 + rom.length)
      else if (alt && n.startsWith(alt)) score = Math.max(score, 28 + alt.length)
    }
    if (ward && wordSet.has(ward)) score = Math.max(score, 60 + ward.length)
    if (rom && wordSet.has(rom)) score = Math.max(score, 50 + rom.length)
    if (alt && wordSet.has(alt)) score = Math.max(score, 48 + alt.length)
    if (score > cityScore) { cityScore = score; cityIndex = i }
  }
  if (cityIndex !== null && prefIndex === null) prefIndex = dict.cities[cityIndex][0]

  const isAdminSegment = (seg: string) => {
    const n = norm(seg)
    if (prefIndex !== null && n.includes(norm(dict.prefs[prefIndex][2]))) return true
    if (cityIndex !== null) {
      const c = dict.cities[cityIndex]
      if (c[3] && n.includes(norm(c[3]))) return true
      if (c[4] && n.includes(norm(c[4]))) return true
    }
    return /^(japan|jp)$/.test(n)
  }

  // Street segment: the one carrying hyphenated block numbers.
  let blockIndex = segments.findIndex((seg) => /\d+\s*-\s*\d+/.test(seg))
  if (blockIndex === -1) {
    blockIndex = segments.findIndex((seg) => /^\d/.test(seg) && !/^\d+[a-z]/i.test(seg))
  }
  const street = blockIndex >= 0 ? segments[blockIndex] : ''

  // Town: search the street segment first, then the other non-admin segments.
  const findTown = (hay: string): number | null => {
    if (!towns) return null
    const n = norm(hay)
    let best: number | null = null
    let bestLen = 0
    for (let i = 0; i < towns.length; i++) {
      const t = towns[i]
      if (t[0] !== cityIndex) continue
      for (const cand of [t[3], t[4]]) {
        if (!cand) continue
        const r = norm(cand)
        if (r && n.includes(r) && r.length > bestLen) { best = i; bestLen = r.length }
      }
    }
    return best
  }

  let townIndex: number | null = null
  if (towns && cityIndex !== null) {
    if (street) townIndex = findTown(street)
    if (townIndex === null) {
      for (let i = 0; i < segments.length; i++) {
        if (i === blockIndex || isAdminSegment(segments[i])) continue
        const t = findTown(segments[i])
        if (t !== null) { townIndex = t; break }
      }
    }
  }

  // Block numbers
  let block = ''
  if (street) {
    const hyphenated = street.match(/\d+(?:\s*-\s*\d+)+/)
    if (hyphenated) block = hyphenated[0].replace(/\s*-\s*/g, '-')
    else {
      const plain = street.match(/^\d+/)
      if (plain) block = plain[0]
    }
  }

  const building = blockIndex > 0
    ? segments.slice(0, blockIndex).filter((s) => !isAdminSegment(s)).join(', ')
    : ''

  const japanese = [
    postalCode ? `〒${postalCode.slice(0, 3)}-${postalCode.slice(3)}` : '',
    prefIndex !== null ? dict.prefs[prefIndex][0] : '',
    cityIndex !== null ? dict.cities[cityIndex][1] : '',
    townIndex !== null && towns ? towns[townIndex][1] : '',
    block,
    building,
  ].filter(Boolean).join(' ')

  if (prefIndex === null) notes.push('都道府県を特定できませんでした。')
  if (prefIndex !== null && cityIndex === null) notes.push('市区町村を特定できませんでした。')
  if (cityIndex !== null && townIndex === null) notes.push('町名を特定できませんでした。')

  const score =
    (prefIndex !== null ? 40 : 0) +
    (cityIndex !== null ? 30 : 0) +
    (townIndex !== null ? 20 : 0) +
    (block ? 10 : 0)

  return {
    japanese,
    postalCode,
    prefIndex,
    cityIndex,
    townIndex,
    pref: prefIndex !== null ? dict.prefs[prefIndex][0] : '',
    city: cityIndex !== null ? dict.cities[cityIndex][1] : '',
    town: townIndex !== null && towns ? towns[townIndex][1] : '',
    block,
    building,
    notes,
    score,
  }
}
