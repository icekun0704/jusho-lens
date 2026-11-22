import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { UploadLinearIcon, DownloadLinearIcon } from '@/components/icons'
import { loadDictionary, loadTowns, type Dictionary, type TownEntry } from '@/lib/address-data'
import { parseJapanese, toPieces } from '@/lib/address'
import { buildFields, validateFields, validateParsed } from '@/lib/presets'
import { downloadText, parseCsv, toCsv } from '@/lib/csv'

interface RowResult {
  source: string
  postal: string
  pref: string
  city: string
  town: string
  block: string
  line1: string
  line2: string
  cityField: string
  state: string
  postalField: string
  country: string
  status: string
  note: string
}

const SAMPLE = `住所,建物名（ローマ字）
〒150-0041 東京都渋谷区神南1-2-3,Shibuya Building 4F
大阪府大阪市北区中之島2-1-1,
北海道札幌市中央区北一条西2丁目,`

export function BatchPage() {
  const [csvText, setCsvText] = useState(SAMPLE)
  const [rows, setRows] = useState<RowResult[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const limit = 1000

  async function onFile(file: File) {
    const text = await file.text()
    setCsvText(text)
  }

  async function convert() {
    setBusy(true)
    setError('')
    try {
      const dict: Dictionary = await loadDictionary()
      const table = parseCsv(csvText)
      const first = table[0]?.[0] ?? ''
      const hasHeader = /住所|address/i.test(first)
      const dataRows = (hasHeader ? table.slice(1) : table).filter((r) => (r[0] ?? '').trim())
      const limited = dataRows.slice(0, limit)
      const cache = new Map<number, TownEntry[]>()
      const out: RowResult[] = []

      for (const row of limited) {
        const address = (row[0] ?? '').trim()
        const buildingInput = (row[1] ?? '').trim()
        const head = parseJapanese(address, dict, null)
        let towns: TownEntry[] | null = null
        if (head.prefIndex !== null) {
          if (!cache.has(head.prefIndex)) cache.set(head.prefIndex, await loadTowns(head.prefIndex))
          towns = cache.get(head.prefIndex) ?? null
        }
        const parsed = towns ? parseJapanese(address, dict, towns) : head
        const base = toPieces(parsed, dict)
        const pieces = { ...base, building: buildingInput || base.building }
        const townRomaji = parsed.townIndex !== null && towns ? towns[parsed.townIndex][3] : ''
        const fields = buildFields(pieces, townRomaji, 'amazon')
        const issues = [
          ...validateParsed(parsed.notes, parsed.score),
          ...validateFields(fields),
        ]
        const hasError = issues.some((i) => i.level === 'error')
        out.push({
          source: address,
          postal: parsed.postalCode ? `${parsed.postalCode.slice(0, 3)}-${parsed.postalCode.slice(3)}` : '',
          pref: parsed.pref,
          city: parsed.city,
          town: parsed.town,
          block: parsed.block,
          line1: fields[0].value,
          line2: fields[1].value,
          cityField: fields[2].value,
          state: fields[3].value,
          postalField: fields[4].value,
          country: fields[5].value,
          status: hasError ? '要確認' : parsed.score >= 85 ? 'OK' : '確認',
          note: issues.map((i) => i.message).join(' / '),
        })
      }
      setRows(out)
      if (dataRows.length > limit) {
        setError(`一度に処理できるのは ${limit} 件までです（${dataRows.length} 件中 ${limit} 件を変換）。ファイルを分けてください。`)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function download() {
    const header = ['元の住所', '郵便番号', '都道府県', '市区町村', '町名', '番地', 'Address Line 1', 'Address Line 2', 'City', 'State/Province', 'Postal Code', 'Country', '状態', 'メモ']
    const body = rows.map((r) => [r.source, r.postal, r.pref, r.city, r.town, r.block, r.line1, r.line2, r.cityField, r.state, r.postalField, r.country, r.status, r.note])
    downloadText('address-en.csv', toCsv([header, ...body]))
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-3xl tracking-tight">CSV一括変換</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        1列目に日本語の住所、2列目に建物名のローマ字（任意）を入れてください。ヘッダー行は自動で判定します。変換はブラウザ内で完結します。
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
              <UploadLinearIcon className="size-4" aria-hidden="true" />
              CSVを選択
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              aria-label="CSVファイルを選択"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
            />
            <span className="text-xs text-muted-foreground">
              1回 1,000 件まで
            </span>
          </div>

          <Textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={10}
            spellCheck={false}
            className="mt-3 font-mono text-[12px] leading-relaxed"
            aria-label="CSV"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={convert} disabled={busy || !csvText.trim()}>
              {busy ? '変換中…' : '変換する'}
            </Button>
            {rows.length > 0 && (
              <Button variant="outline" className="gap-1.5" onClick={download}>
                <DownloadLinearIcon className="size-4" aria-hidden="true" />
                CSVをダウンロード
              </Button>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-(--warning-text)">{error}</p>}
        </div>

        <Card variant="plate" className="p-4">
          <h2 className="text-sm font-medium">入力の形式</h2>
          <pre className="mt-2 overflow-x-auto rounded-md bg-background px-3 py-2 font-mono text-[11px] leading-relaxed">
{SAMPLE}
          </pre>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>・1列目：住所（都道府県から）</li>
            <li>・2列目：建物名のローマ字（任意）</li>
            <li>・3列目以降は無視します</li>
            <li>・郵便番号は住所に含めても、別列でもかまいません</li>
          </ul>
        </Card>
      </div>

      {rows.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl tracking-tight">結果</h2>
            <p className="text-xs text-muted-foreground">{rows.length} 件</p>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead className="bg-secondary">
                <tr>
                  {['状態', '元の住所', 'Address Line 1', 'Address Line 2', 'City', 'State', 'Postal'].map((h) => (
                    <th key={h} className="whitespace-nowrap border-b border-border px-3 py-2 font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 align-top">
                      <Badge variant={r.status === 'OK' ? 'success' : r.status === '要確認' ? 'destructive' : 'warning'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="max-w-[16rem] px-3 py-2 align-top">
                      <span className="line-clamp-2">{r.source}</span>
                      {r.note && <span className="mt-1 block text-[11px] text-(--warning-text)">{r.note}</span>}
                    </td>
                    <td className="px-3 py-2 align-top font-mono">{r.line1}</td>
                    <td className="px-3 py-2 align-top font-mono">{r.line2}</td>
                    <td className="px-3 py-2 align-top font-mono">{r.cityField}</td>
                    <td className="px-3 py-2 align-top font-mono">{r.state}</td>
                    <td className="px-3 py-2 align-top font-mono">{r.postalField}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
