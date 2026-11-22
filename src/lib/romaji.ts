/**
 * Japanese kana → Hepburn-style romaji.
 *
 * Tuned for Japanese place names and personal names: long vowels are written
 * without macrons (Toukyou → Tokyo, Oosaka → Osaka), which is the convention
 * used on road signs, station signs and in most English-language addresses.
 */

export interface RomajiOptions {
  /** Collapse long vowels: ou/oo → o, uu → u. Default true. */
  collapseLongVowels?: boolean
  /** Write ん as n' before a vowel or y. Default true. */
  apostropheN?: boolean
  /** Passport style: write ん as m before b, m and p (Namba, Homma). */
  nBeforeBmpAsM?: boolean
  /** What to do with the katakana long-vowel mark ー. Default 'drop'. */
  longVowelMark?: 'drop' | 'repeat'
}

const KATAKANA_TO_HIRAGANA: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (let c = 0x30a1; c <= 0x30f6; c++) {
    map[String.fromCharCode(c)] = String.fromCharCode(c - 0x60)
  }
  map['ヴ'] = 'ゔ'
  map['ヷ'] = 'わ'
  map['ヸ'] = 'ゐ'
  map['ヹ'] = 'ゑ'
  map['ヺ'] = 'を'
  return map
})()

const FULLWIDTH_ALNUM: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (let c = 0xff10; c <= 0xff19; c++) map[String.fromCharCode(c)] = String.fromCharCode(c - 0xfee0)
  for (let c = 0xff21; c <= 0xff3a; c++) map[String.fromCharCode(c)] = String.fromCharCode(c - 0xfee0)
  for (let c = 0xff41; c <= 0xff5a; c++) map[String.fromCharCode(c)] = String.fromCharCode(c - 0xfee0)
  return map
})()

export function toHiragana(input: string): string {
  let out = ''
  for (const ch of input) {
    out += KATAKANA_TO_HIRAGANA[ch] ?? FULLWIDTH_ALNUM[ch] ?? ch
  }
  return out
}

/** Single-kana and two-kana syllable table. */
const SYLLABLES: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', ゐ: 'i', ゑ: 'e', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
  ゕ: 'ka', ゖ: 'ke',

  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo', きぇ: 'kye',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho', しぇ: 'she',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho', ちぇ: 'che',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo', じぇ: 'je',
  ぢゃ: 'ja', ぢゅ: 'ju', ぢょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
  ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo', ふゅ: 'fyu',
  てぃ: 'ti', てゅ: 'tyu', でぃ: 'di', でゅ: 'dyu',
  とぅ: 'tu', どぅ: 'du',
  うぃ: 'wi', うぇ: 'we', うぉ: 'wo',
  ゔぁ: 'va', ゔぃ: 'vi', ゔぇ: 've', ゔぉ: 'vo', ゔゅ: 'vyu',
  くぁ: 'kwa', くぃ: 'kwi', くぇ: 'kwe', くぉ: 'kwo',
  ぐぁ: 'gwa', ぐぃ: 'gwi', ぐぇ: 'gwe', ぐぉ: 'gwo',
  つぁ: 'tsa', つぃ: 'tsi', つぇ: 'tse', つぉ: 'tso',
  ずぃ: 'zi',
  すぃ: 'si',
}

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o'])

function collapseLongVowels(romaji: string): string {
  // oo → o (Oosaka → Osaka), uu → u (Yuuko → Yuko).
  // ou → o only when a consonant or the end follows: Toukyou → Tokyo, Satou →
  // Sato, but Inoue (いのうえ) keeps its ou because a vowel follows.
  // ii and ei are kept: Niigata, Nagai, Ebisu.
  return romaji
    .replace(/oo/g, 'o')
    .replace(/uu/g, 'u')
    .replace(/ou(?![aiueo])/g, 'o')
}

export function kanaToRomaji(input: string, options: RomajiOptions = {}): string {
  const {
    collapseLongVowels: collapse = true,
    apostropheN = true,
    nBeforeBmpAsM = false,
    longVowelMark = 'drop',
  } = options
  const hira = toHiragana(input)
  let out = ''
  let i = 0
  while (i < hira.length) {
    const ch = hira[i]
    if (ch === 'っ') {
      // Sokuon: double the next consonant; ch becomes tch.
      const next = readSyllable(hira, i + 1)
      if (next) {
        const r = next.romaji
        out += r.startsWith('ch') ? 't' + r : r[0] + r
        i = next.end
        continue
      }
      i += 1
      continue
    }
    if (ch === 'ー' || ch === '−' || ch === '—') {
      if (longVowelMark === 'repeat') {
        const last = out.match(/[aiueo](?!.*[aiueo])/)
        out += last ? last[0] : ''
      }
      i += 1
      continue
    }
    const syl = readSyllable(hira, i)
    if (syl) {
      if (syl.romaji === 'n') {
        const after = readSyllable(hira, syl.end)
        if (after && nBeforeBmpAsM && /^[bmp]/.test(after.romaji)) {
          out += 'm'
        } else if (after && (VOWELS.has(after.romaji[0]) || after.romaji[0] === 'y')) {
          out += apostropheN ? "n'" : 'n'
        } else {
          out += 'n'
        }
      } else {
        out += syl.romaji
      }
      i = syl.end
      continue
    }
    if (ch === ' ' || ch === '　') {
      out += ' '
    } else if (/[A-Za-z0-9]/.test(ch)) {
      out += ch
    } else if (ch === '・' || ch === '･' || ch === '=' || ch === '＝') {
      out += ' '
    }
    i += 1
  }
  const cleaned = out.replace(/\s+/g, ' ').trim()
  return collapse ? collapseLongVowels(cleaned) : cleaned
}

function readSyllable(
  s: string,
  index: number,
): { romaji: string; end: number } | null {
  if (index >= s.length) return null
  const two = s.slice(index, index + 2)
  if (SYLLABLES[two] !== undefined) return { romaji: SYLLABLES[two], end: index + 2 }
  const one = s[index]
  if (SYLLABLES[one] !== undefined) return { romaji: SYLLABLES[one], end: index + 1 }
  return null
}

/** "shibuya-ku" → "Shibuya-ku": capitalise only the first letter of a place name. */
export function capFirst(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
}

/** Capitalise each word without destroying existing capitals ("4F" stays "4F"). */
export function titleCaseRomaji(value: string): string {
  return value.replace(/(^|[\s\-'])([a-zA-Z])/g, (_, sep: string, c: string) => sep + c.toUpperCase())
}

/** Romanise a Japanese name and return "Surname Given" in the requested case. */
export function nameToRomaji(
  surname: string,
  given: string,
  options: RomajiOptions & { uppercase?: boolean } = {},
): string {
  const { uppercase = false, ...rest } = options
  const s = kanaToRomaji(surname, rest)
  const g = kanaToRomaji(given, rest)
  const joined = [s, g].filter(Boolean).join(' ')
  return uppercase ? joined.toUpperCase() : titleCaseRomaji(joined)
}

/**
 * Municipality suffixes that read differently inside a place name than as a
 * standalone word are already covered by the dictionary. This helper only
 * normalises the handful of administrative suffixes an English address keeps.
 */
export function romajiPlaceSuffix(suffix: string): string {
  const map: Record<string, string> = {
    都: '-to',
    道: '-do',
    府: '-fu',
    県: '-ken',
    市: '-shi',
    区: '-ku',
    町: '-cho',
    村: '-mura',
    郡: '-gun',
    丁目: '-chome',
  }
  return map[suffix] ?? suffix
}
