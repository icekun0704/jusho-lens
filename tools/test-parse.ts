import fs from 'node:fs'
import path from 'node:path'
import { formatRomaji, parseJapanese, reverseLookup, toPieces } from '../src/lib/address.ts'
import type { CityEntry, Dictionary, PrefEntry, TownEntry } from '../src/lib/address-data.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const prefs: PrefEntry[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/prefs.json'), 'utf8'))
const cities: CityEntry[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/cities.json'), 'utf8'))
const dict: Dictionary = { prefs, cities }
const townCache = new Map<number, TownEntry[]>()

function towns(pref: number): TownEntry[] {
  let t = townCache.get(pref)
  if (!t) {
    t = JSON.parse(fs.readFileSync(path.join(ROOT, `public/data/towns/${pref}.json`), 'utf8'))
    townCache.set(pref, t)
  }
  return t
}

function parse(input: string) {
  const head = parseJapanese(input, dict, null)
  const t = head.prefIndex !== null ? towns(head.prefIndex) : null
  const parsed = t ? parseJapanese(input, dict, t) : head
  const pieces = toPieces(parsed, dict)
  const townRomaji = parsed.townIndex !== null && t ? t[parsed.townIndex][3] : ''
  return {
    parsed,
    lines: formatRomaji(pieces, townRomaji, 'oneline'),
    fields: formatRomaji(pieces, townRomaji, 'fields'),
  }
}

const forward: [string, string, string, string][] = [
  ['〒150-0041 東京都渋谷区神南1-2-3', '東京都', '渋谷区', '神南'],
  ['大阪府大阪市北区中之島2-1-1', '大阪府', '大阪市北区', '中之島'],
  ['北海道札幌市中央区北一条西2丁目', '北海道', '札幌市中央区', '北一条西'],
  ['京都府京都市中京区寺町通御池上る上本能寺前町488', '京都府', '京都市中京区', '上本能寺前町'],
  ['沖縄県那覇市久茂地1-1-1', '沖縄県', '那覇市', '久茂地'],
  ['神奈川県横浜市西区みなとみらい2-3-1', '神奈川県', '横浜市西区', 'みなとみらい'],
  ['東京都千代田区丸の内1-1-1', '東京都', '千代田区', '丸の内'],
  ['福岡県福岡市博多区博多駅前2-1-1', '福岡県', '福岡市博多区', '博多駅前'],
  ['愛知県名古屋市中村区名駅1-1-4', '愛知県', '名古屋市中村区', '名駅'],
  ['北海道札幌市北区北八条西5丁目', '北海道', '札幌市北区', '北八条西'],
  ['東京都世田谷区三軒茶屋2-11-22', '東京都', '世田谷区', '三軒茶屋'],
  ['長野県北佐久郡軽井沢町長倉2148', '長野県', '北佐久郡軽井沢町', '長倉'],
  ['沖縄県石垣市新川1', '沖縄県', '石垣市', '新川'],
  ['東京都港区赤坂9-7-1', '東京都', '港区', '赤坂'],
  ['宮城県仙台市青葉区一番町3-1-1', '宮城県', '仙台市青葉区', '一番町'],
]

let failed = 0
console.log('--- forward ---')
for (const [input, pref, city, town] of forward) {
  const r = parse(input)
  const ok = r.parsed.pref === pref && r.parsed.city === city && r.parsed.town === town
  if (!ok) failed++
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${input}\n      → ${r.parsed.pref} / ${r.parsed.city} / ${r.parsed.town} / ${r.parsed.block}   [${r.lines[0]}]`,
  )
}

const reverse: [string, string, string][] = [
  ['4F Shibuya Building, 1-2-3 Jinnan, Shibuya-ku, Tokyo 150-0041, Japan', '東京都', '渋谷区'],
  ['2-1-1 Nakanoshima, Kita-ku, Osaka 530-0005, Japan', '大阪府', '大阪市北区'],
  ['2 Kita 1-jo Nishi, Chuo-ku, Sapporo, Hokkaido 060-0000, Japan', '北海道', '札幌市中央区'],
  ['1-1 Kumoji, Naha, Okinawa 900-0015, Japan', '沖縄県', '那覇市'],
  ['1-1 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan', '東京都', '千代田区'],
  ['1-1 Marunochi, Chiyoda-ku, Tokyo 100-0005, Japan', '東京都', '千代田区'],
]

console.log('--- reverse ---')
for (const [input, pref, city] of reverse) {
  const head = reverseLookup(input, dict, null)
  const t = head.prefIndex !== null ? towns(head.prefIndex) : null
  const r = t ? reverseLookup(input, dict, t) : head
  const ok = r.pref === pref && r.city === city
  if (!ok) failed++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${input}\n      → ${r.japanese}  (score ${r.score})`)
}

console.log(failed === 0 ? 'ALL PASSED' : `${failed} FAILED`)
process.exit(failed ? 1 : 0)
