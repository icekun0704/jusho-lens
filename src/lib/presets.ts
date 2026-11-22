import type { AddressFormat, RomajiPieces } from './address'
import { formatRomaji, formatTown, postalHyphen } from './address'
import { capFirst, titleCaseRomaji } from './romaji'

export type PresetId = 'generic' | 'postal' | 'amazon' | 'wise' | 'ds160' | 'card'

export interface Preset {
  id: PresetId
  name: string
  description: string
  format: AddressFormat
  layout: 'text' | 'fields'
}

export const PRESETS: Preset[] = [
  {
    id: 'generic',
    name: '汎用（1行）',
    description: 'メールやチャットに貼る用。1行にまとめます。',
    format: 'oneline',
    layout: 'text',
  },
  {
    id: 'postal',
    name: '国際郵便',
    description: '日本郵便の推奨順（小さい単位から）。封筒の宛名向け。',
    format: 'postal',
    layout: 'text',
  },
  {
    id: 'amazon',
    name: 'Amazon US',
    description: '米国Amazonの入力欄に合わせて分割します。',
    format: 'fields',
    layout: 'fields',
  },
  {
    id: 'wise',
    name: 'Wise / 海外送金',
    description: 'Wiseなど海外フィンテックの住所欄向け。',
    format: 'fields',
    layout: 'fields',
  },
  {
    id: 'ds160',
    name: 'DS-160 / ビザ',
    description: '米国ビザ申請フォームの欄名に合わせます。',
    format: 'fields',
    layout: 'fields',
  },
  {
    id: 'card',
    name: 'カード請求先',
    description: 'クレジットカードの請求先住所向け。',
    format: 'fields',
    layout: 'fields',
  },
]

export function getPreset(id: PresetId): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]
}

export interface FieldRow {
  label: string
  value: string
  hint?: string
}

const FIELD_LABELS: Record<Exclude<PresetId, 'generic' | 'postal'>, {
  line1: string
  line2: string
  city: string
  state: string
  postal: string
  country: string
}> = {
  amazon: {
    line1: 'Address line 1',
    line2: 'Address line 2',
    city: 'City',
    state: 'State / Province / Region',
    postal: 'ZIP / Postal code',
    country: 'Country',
  },
  wise: {
    line1: 'Address line 1',
    line2: 'Address line 2',
    city: 'City',
    state: 'State / Province',
    postal: 'Postcode',
    country: 'Country',
  },
  ds160: {
    line1: 'Address Line 1',
    line2: 'Address Line 2',
    city: 'City',
    state: 'State/Province',
    postal: 'Postal Zone/Zip Code',
    country: 'Country/Region',
  },
  card: {
    line1: 'Address Line 1',
    line2: 'Address Line 2',
    city: 'City',
    state: 'State',
    postal: 'Postal Code',
    country: 'Country',
  },
}

export function buildFields(pieces: RomajiPieces, townRomaji: string, preset: PresetId): FieldRow[] {
  const labels = FIELD_LABELS[preset as Exclude<PresetId, 'generic' | 'postal'>] ?? FIELD_LABELS.amazon
  const street = [pieces.block, formatTown(townRomaji)].filter(Boolean).join(' ')
  const building = pieces.building ? titleCaseRomaji(pieces.building) : ''
  const city = pieces.ward
    ? [capFirst(pieces.ward), ...pieces.cityParts.map(capFirst)].join(', ')
    : pieces.cityParts.map(capFirst).join(', ')
  const rows: FieldRow[] = [
    { label: labels.line1, value: street },
    { label: labels.line2, value: building },
    { label: labels.city, value: city },
    { label: labels.state, value: capFirst(pieces.pref) },
    { label: labels.postal, value: postalHyphen(pieces.postalCode) },
    { label: labels.country, value: 'Japan' },
  ]
  return rows
}

export function formatText(pieces: RomajiPieces, townRomaji: string, preset: PresetId): string[] {
  return formatRomaji(pieces, townRomaji, getPreset(preset).format)
}

export interface Issue {
  level: 'error' | 'warn'
  message: string
}

const NON_LATIN = /[^\x20-\x7E]/

export function validateFields(rows: FieldRow[]): Issue[] {
  const issues: Issue[] = []
  for (const row of rows) {
    if (!row.value) continue
    if (NON_LATIN.test(row.value)) {
      issues.push({ level: 'error', message: `${row.label} に日本語が残っています。` })
    }
    if (/^Address line 1$|^Address Line 1$/.test(row.label) && row.value.length > 40) {
      issues.push({ level: 'warn', message: `${row.label} が40文字を超えています（フォームによっては弾かれます）。` })
    }
    if (/^City$/.test(row.label) && row.value.length > 30) {
      issues.push({ level: 'warn', message: `${row.label} が30文字を超えています。` })
    }
  }
  const line1 = rows[0]
  if (!line1?.value) issues.push({ level: 'error', message: '番地・町名が空です。' })
  const city = rows.find((r) => r.label === 'City')
  if (!city?.value) issues.push({ level: 'error', message: '市区町村が空です。' })
  const postal = rows.find((r) => /Postal|Postcode|ZIP/.test(r.label))
  if (postal?.value && !/^\d{3}-\d{4}$/.test(postal.value)) {
    issues.push({ level: 'warn', message: '郵便番号が7桁で認識されていません。' })
  }
  return issues
}

/** Validate a Japanese address before converting. */
export function validateParsed(notes: string[], score: number): Issue[] {
  const issues: Issue[] = []
  for (const n of notes) issues.push({ level: 'error', message: n })
  if (score < 70 && issues.length === 0) {
    issues.push({ level: 'warn', message: '住所の一部しか認識できませんでした。都道府県から入力してください。' })
  }
  return issues
}
