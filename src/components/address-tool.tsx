import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  CheckCircleLinearIcon,
  DangerTriangleLinearIcon,
  InfoCircleLinearIcon,
  PrinterLinearIcon,
} from '@/components/icons'
import { CopyButton } from '@/components/copy-button'
import {
  loadDictionary,
  loadTowns,
  type Dictionary,
  type TownEntry,
} from '@/lib/address-data'
import {
  formatRomaji,
  parseJapanese,
  reverseLookup,
  toPieces,
  type ParsedAddress,
  type ReverseResult,
} from '@/lib/address'
import {
  PRESETS,
  buildFields,
  getPreset,
  validateFields,
  validateParsed,
  type Issue,
  type PresetId,
} from '@/lib/presets'
import {
  formatPostalInput,
  lookupPostal,
  normalizePostal,
  type PostalHit,
} from '@/lib/postal'
import { kanaToRomaji, titleCaseRomaji } from '@/lib/romaji'
import { cn } from '@/lib/utils'

const REVERSE_EXAMPLES = [
  '4F Shibuya Building, 1-2-3 Jinnan, Shibuya-ku, Tokyo 150-0041, Japan',
  '2-1-1 Nakanoshima, Kita-ku, Osaka 530-0005, Japan',
  '1-1 Chiyoda, Chiyoda-ku, Tokyo 100-8111, Japan',
]

const FORWARD_EXAMPLES = [
  '〒150-0041 東京都渋谷区神南1-2-3',
  '大阪府大阪市北区中之島2-1-1',
  '北海道札幌市中央区北一条西2丁目',
]

const INITIAL_REVERSE = REVERSE_EXAMPLES[0]
const INITIAL_FORWARD = FORWARD_EXAMPLES[0]

function useDebouncedEffect(fn: () => void | (() => void), deps: unknown[], delay = 220) {
  useEffect(() => {
    const timer = window.setTimeout(fn, delay)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

function confidenceOf(score: number): { label: string; variant: 'success' | 'warning' | 'destructive' } {
  if (score >= 85) return { label: '高', variant: 'success' }
  if (score >= 55) return { label: '中', variant: 'warning' }
  return { label: '低', variant: 'destructive' }
}

function IssueList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-(--success-text)">
        <CheckCircleLinearIcon className="size-4 shrink-0" aria-hidden="true" />
        このまま使えます。
      </p>
    )
  }
  return (
    <ul className="space-y-1.5">
      {issues.map((issue, i) => (
        <li
          key={i}
          className={cn(
            'flex items-start gap-1.5 text-sm',
            issue.level === 'error' ? 'text-(--destructive-text)' : 'text-(--warning-text)',
          )}
        >
          {issue.level === 'error' ? (
            <DangerTriangleLinearIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : (
            <InfoCircleLinearIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{issue.message}</span>
        </li>
      ))}
    </ul>
  )
}

function printLines(lines: string[], title: string) {
  const win = window.open('', '_blank', 'width=620,height=820')
  if (!win) return
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)
  win.document.write(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      @page { size: A4; margin: 22mm 18mm; }
      body { font: 15px/1.8 -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif; white-space: pre-wrap; color: #222; }
      .label { border: 1px solid #bbb; padding: 16mm 12mm; border-radius: 4px; }
    </style></head><body><div class="label">${esc(lines.join('\n'))}</div></body></html>`,
  )
  win.document.close()
  win.focus()
  win.print()
}

export function AddressTool() {
  const [tab, setTab] = useState('reverse')
  const [dict, setDict] = useState<Dictionary | null>(null)
  const [dictError, setDictError] = useState('')

  useEffect(() => {
    let alive = true
    loadDictionary()
      .then((d) => { if (alive) setDict(d) })
      .catch((e: Error) => { if (alive) setDictError(e.message) })
    return () => { alive = false }
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card shadow-(--shadow-card)">
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <div className="border-b border-border px-3 py-2.5">
          <TabsList className="h-auto flex-wrap gap-0.5 p-1">
            <TabsTrigger value="reverse" className="px-2 text-[13px] sm:px-3 sm:text-sm">
              英語 → 日本語
            </TabsTrigger>
            <TabsTrigger value="forward" className="px-2 text-[13px] sm:px-3 sm:text-sm">
              日本語 → 英語
            </TabsTrigger>
            <TabsTrigger value="postal" className="px-2 text-[13px] sm:px-3 sm:text-sm">
              郵便番号
            </TabsTrigger>
            <TabsTrigger value="name" className="px-2 text-[13px] sm:px-3 sm:text-sm">
              氏名
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="p-4 sm:p-5">
          <TabsContent value="reverse" className="mt-0">
            <ReversePanel dict={dict} dictError={dictError} />
          </TabsContent>
          <TabsContent value="forward" className="mt-0">
            <ForwardPanel dict={dict} dictError={dictError} />
          </TabsContent>
          <TabsContent value="postal" className="mt-0">
            <PostalPanel dict={dict} dictError={dictError} />
          </TabsContent>
          <TabsContent value="name" className="mt-0">
            <NamePanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function ReversePanel({ dict, dictError }: { dict: Dictionary | null; dictError: string }) {
  const [input, setInput] = useState(INITIAL_REVERSE)
  const [result, setResult] = useState<ReverseResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useDebouncedEffect(() => {
    if (!dict) return
    const text = input.trim()
    if (!text) { setResult(null); setBusy(false); return }
    let alive = true
    setBusy(true)
    setError('')
    ;(async () => {
      try {
        const first = reverseLookup(text, dict, null)
        let towns: TownEntry[] | null = null
        if (first.prefIndex !== null) towns = await loadTowns(first.prefIndex)
        if (!alive) return
        setResult(towns ? reverseLookup(text, dict, towns) : first)
      } catch (e) {
        if (alive) setError((e as Error).message)
      } finally {
        if (alive) setBusy(false)
      }
    })()
    return () => { alive = false }
  }, [input, dict])

  const confidence = result ? confidenceOf(result.score) : null

  return (
    <div>
      <Label htmlFor="reverse-input" className="text-sm font-medium">
        英語の住所を貼り付け
      </Label>
      <Textarea
        id="reverse-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        spellCheck={false}
        placeholder="4F Shibuya Building, 1-2-3 Jinnan, Shibuya-ku, Tokyo 150-0041, Japan"
        className="mt-2 font-mono text-[13px] leading-relaxed"
      />
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">例</span>
        {REVERSE_EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setInput(ex)}
            className="max-w-full truncate rounded-sm bg-(--field) px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {ex.length > 46 ? `${ex.slice(0, 46)}…` : ex}
          </button>
        ))}
      </div>

      {dictError && <p className="mt-4 text-sm text-(--destructive-text)">{dictError}</p>}

      <div className="mt-4">
        {!dict ? (
          <p className="text-sm text-muted-foreground">辞書を読み込んでいます…</p>
        ) : busy && !result ? (
          <p className="text-sm text-muted-foreground">変換しています…</p>
        ) : result && result.score > 0 ? (
          <Card variant="plate" className="gap-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">result</p>
                <p className="mt-2 break-keep font-serif text-xl leading-relaxed text-foreground sm:text-2xl">
                  {result.japanese || '—'}
                </p>
              </div>
              {confidence && (
                <div className="shrink-0 rounded-sm border border-primary/35 px-3 py-1.5 text-center">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-(--primary-text)">match</span>
                  <span className="block font-serif text-lg leading-tight text-(--primary-text)">{confidence.label}</span>
                </div>
              )}
            </div>

            <Separator />

            <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              <FieldRow label="郵便番号" value={result.postalCode ? `〒${result.postalCode.slice(0, 3)}-${result.postalCode.slice(3)}` : ''} />
              <FieldRow label="都道府県" value={result.pref} />
              <FieldRow label="市区町村" value={result.city} />
              <FieldRow label="町名" value={result.town} />
              <FieldRow label="番地" value={result.block} />
              <FieldRow label="建物名" value={result.building} />
            </dl>

            <IssueList issues={result.notes.map((n) => ({ level: 'error', message: n }))} />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CopyButton text={result.japanese} label="住所をコピー" />
              <span className="text-xs text-muted-foreground">
                英数字・記号はそのまま残しています。建物名は手で直してください。
              </span>
            </div>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            英語の住所を貼り付けると、対応する日本の住所を表示します。
          </p>
        )}
        {error && <p className="mt-3 text-sm text-(--destructive-text)">{error}</p>}
      </div>
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <span className="mb-1 flex-1 self-end border-b border-dotted border-border" aria-hidden="true" />
      <dd className={cn('max-w-[62%] truncate text-right text-sm', value ? 'text-foreground' : 'text-muted-foreground/60')}>
        {value || '—'}
      </dd>
    </div>
  )
}

function ForwardPanel({ dict, dictError }: { dict: Dictionary | null; dictError: string }) {
  const [input, setInput] = useState(INITIAL_FORWARD)
  const [preset, setPreset] = useState<PresetId>('generic')
  const [parsed, setParsed] = useState<ParsedAddress | null>(null)
  const [towns, setTowns] = useState<TownEntry[] | null>(null)
  const [buildingOverride, setBuildingOverride] = useState('')
  const [error, setError] = useState('')
  const [postalInput, setPostalInput] = useState('')
  const [postalHits, setPostalHits] = useState<PostalHit[]>([])

  useEffect(() => { setBuildingOverride('') }, [input])

  function applyPostalHits(hits: PostalHit[]) {
    if (hits.length === 1) {
      setInput(`${hits[0].pref}${hits[0].city}${hits[0].town}`)
      setPostalHits([])
    } else if (hits.length > 1) {
      setPostalHits(hits)
    }
  }

  async function onPostalChange(value: string) {
    const formatted = formatPostalInput(value)
    setPostalInput(formatted)
    const digits = normalizePostal(formatted)
    if (digits.length === 7 && dict) {
      try {
        applyPostalHits(await lookupPostal(digits, dict))
      } catch {
        setPostalHits([])
      }
    } else {
      setPostalHits([])
    }
  }

  // A bare postcode typed into the textarea expands to its address.
  useDebouncedEffect(() => {
    if (!dict) return
    const digits = normalizePostal(input)
    const rest = input.replace(/[〒0-9\-\s]/g, '')
    if (digits.length === 7 && rest === '') {
      let alive = true
      lookupPostal(digits, dict)
        .then((hits) => { if (alive) applyPostalHits(hits) })
        .catch(() => {})
      return () => { alive = false }
    }
  }, [input, dict])

  useDebouncedEffect(() => {
    if (!dict) return
    const text = input.trim()
    if (!text) { setParsed(null); setTowns(null); return }
    let alive = true
    setError('')
    ;(async () => {
      try {
        const first = parseJapanese(text, dict, null)
        let t: TownEntry[] | null = null
        if (first.prefIndex !== null) t = await loadTowns(first.prefIndex)
        if (!alive) return
        setTowns(t)
        setParsed(t ? parseJapanese(text, dict, t) : first)
      } catch (e) {
        if (alive) setError((e as Error).message)
      }
    })()
    return () => { alive = false }
  }, [input, dict])

  const pieces = useMemo(() => {
    if (!parsed || !dict) return null
    const base = toPieces(parsed, dict)
    return { ...base, building: buildingOverride.trim() || base.building }
  }, [parsed, dict, buildingOverride])

  const townRomaji = parsed?.townIndex != null && towns ? towns[parsed.townIndex][3] : ''
  const lines = pieces ? formatRomaji(pieces, townRomaji, getPreset(preset).format) : []
  const fields = pieces && getPreset(preset).layout === 'fields' ? buildFields(pieces, townRomaji, preset) : []
  const issues: Issue[] = pieces
    ? [...validateParsed(parsed?.notes ?? [], parsed?.score ?? 0), ...(fields.length ? validateFields(fields) : [])]
    : []

  const needsBuildingRomaji = Boolean(parsed?.building) && !parsed?.buildingRomaji

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div>
          <Label htmlFor="forward-postal" className="text-xs font-medium text-muted-foreground">
            郵便番号から住所を入れる
          </Label>
          <Input
            id="forward-postal"
            value={postalInput}
            onChange={(e) => onPostalChange(e.target.value)}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="150-0041"
            className="mt-1 h-8 w-32 font-mono text-[13px]"
          />
        </div>
        <p className="pb-1.5 text-xs text-muted-foreground">7桁で住所を自動入力</p>
      </div>
      {postalHits.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {postalHits.map((h) => (
            <button
              key={`${h.city}${h.town}`}
              type="button"
              onClick={() => { setInput(`${h.pref}${h.city}${h.town}`); setPostalHits([]) }}
              className="rounded-md bg-(--field) px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {h.pref}{h.city}{h.town}
            </button>
          ))}
        </div>
      )}
      <Label htmlFor="forward-input" className="text-sm font-medium">
        日本語の住所を入力
      </Label>
      <Textarea
        id="forward-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        spellCheck={false}
        placeholder="〒150-0041 東京都渋谷区神南1-2-3 渋谷ビル4F"
        className="mt-2 text-[13px] leading-relaxed"
      />
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">例</span>
        {FORWARD_EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setInput(ex)}
            className="max-w-full truncate rounded-sm bg-(--field) px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">用途</p>
        <ToggleGroup
          value={[preset]}
          onValueChange={(v) => { if (v[0]) setPreset(v[0] as PresetId) }}
          className="w-full flex-wrap"
        >
          {PRESETS.map((p) => (
            <ToggleGroupItem key={p.id} value={p.id} className="px-2.5 text-xs">
              {p.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="mt-2 text-xs text-muted-foreground">{getPreset(preset).description}</p>
      </div>

      {dictError && <p className="mt-4 text-sm text-(--destructive-text)">{dictError}</p>}

      <div className="mt-4">
        {!dict ? (
          <p className="text-sm text-muted-foreground">辞書を読み込んでいます…</p>
        ) : pieces ? (
          <Card variant="plate" className="gap-3 p-4">
            {parsed && (parsed.pref || parsed.city || parsed.town) && (
              <p className="text-xs text-muted-foreground">
                認識した住所：{parsed.pref} {parsed.city} {parsed.town} {parsed.block}
              </p>
            )}

            {needsBuildingRomaji && (
              <div>
                <Label htmlFor="building-romaji" className="text-xs text-muted-foreground">
                  建物名のローマ字（漢字は自動変換できません）
                </Label>
                <Input
                  id="building-romaji"
                  value={buildingOverride}
                  onChange={(e) => setBuildingOverride(e.target.value)}
                  placeholder="Shibuya Building 4F"
                  className="mt-1.5 font-mono text-[13px]"
                />
              </div>
            )}

            {fields.length > 0 ? (
              <div className="divide-y divide-border">
                {fields.map((f) => (
                  <div key={f.label} className="flex items-start gap-3 py-2">
                    <span className="w-40 shrink-0 text-xs text-muted-foreground">{f.label}</span>
                    <span className="min-w-0 flex-1 break-words font-mono text-[13px]">
                      {f.value || '—'}
                    </span>
                    {f.value && <CopyButton text={f.value} label="コピー" variant="ghost" />}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
                {lines.join('\n')}
              </pre>
            )}

            <Separator />

            <IssueList issues={issues} />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CopyButton
                text={fields.length ? fields.filter((f) => f.value).map((f) => `${f.label}: ${f.value}`).join('\n') : lines.join('\n')}
                label="すべてコピー"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => printLines(lines, 'Address label')}
              >
                <PrinterLinearIcon className="size-4" aria-hidden="true" />
                印刷
              </Button>
            </div>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            日本語の住所を入れると、英語表記と用途別の入力欄を表示します。
          </p>
        )}
        {error && <p className="mt-3 text-sm text-(--destructive-text)">{error}</p>}
      </div>
    </div>
  )
}

function PostalPanel({ dict, dictError }: { dict: Dictionary | null; dictError: string }) {
  const [code, setCode] = useState('150-0041')
  const [hits, setHits] = useState<PostalHit[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useDebouncedEffect(() => {
    if (!dict) return
    const digits = normalizePostal(code)
    if (digits.length !== 7) { setHits([]); setBusy(false); return }
    let alive = true
    setBusy(true)
    setError('')
    lookupPostal(digits, dict)
      .then((h) => { if (alive) setHits(h) })
      .catch((e: Error) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setBusy(false) })
    return () => { alive = false }
  }, [code, dict])

  const digits = normalizePostal(code)

  return (
    <div>
      <Label htmlFor="postal-code" className="text-sm font-medium">
        郵便番号
      </Label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Input
          id="postal-code"
          value={code}
          onChange={(e) => setCode(formatPostalInput(e.target.value))}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="150-0041"
          className="w-36 font-mono"
        />
        <span className="text-xs text-muted-foreground">7桁を入れると住所が出ます</span>
      </div>

      {dictError && <p className="mt-4 text-sm text-(--destructive-text)">{dictError}</p>}

      <div className="mt-4">
        {!dict ? (
          <p className="text-sm text-muted-foreground">辞書を読み込んでいます…</p>
        ) : busy ? (
          <p className="text-sm text-muted-foreground">検索しています…</p>
        ) : digits.length === 7 && hits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            この郵便番号は辞書にありません。番地まで入れて「日本語 → 英語」を使ってください。
          </p>
        ) : hits.length > 0 && dict ? (
          <ul className="space-y-3">
            {hits.map((h) => {
              const jp = `〒${digits.slice(0, 3)}-${digits.slice(3)} ${h.pref}${h.city}${h.town}`
              const cityEntry = dict.cities[h.cityIndex]
              const en = formatRomaji(
                {
                  postalCode: digits,
                  pref: dict.prefs[h.prefIndex][2],
                  cityParts: cityEntry[3].split(' ').filter(Boolean),
                  ward: cityEntry[4] ?? '',
                  town: '',
                  block: '',
                  building: '',
                },
                h.townRomaji,
                'oneline',
              )[0]
              return (
                <li key={`${h.city}${h.town}`}>
                  <Card variant="plate" className="gap-2 p-4">
                    <p className="text-xs text-muted-foreground">日本語</p>
                    <p className="break-keep font-serif text-lg leading-relaxed">{jp}</p>
                    <Separator />
                    <p className="text-xs text-muted-foreground">英語</p>
                    <p className="break-words font-mono text-[13px] leading-relaxed">{en}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <CopyButton text={jp} label="日本語をコピー" />
                      <CopyButton text={en} label="英語をコピー" />
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            郵便番号を入れると、都道府県・市区町村・町名と英語表記を表示します。
          </p>
        )}
        {error && <p className="mt-3 text-sm text-(--destructive-text)">{error}</p>}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        番地・建物名まで英語にしたいときは、「日本語 → 英語」タブで続きを入力してください。
      </p>
    </div>
  )
}

const NAME_STYLES = [
  { id: 'passport', label: 'パスポート' },
  { id: 'official', label: '公用文（姓のみ大文字）' },
  { id: 'surname', label: '姓 名' },
  { id: 'given', label: '名 姓' },
] as const

type NameStyle = (typeof NAME_STYLES)[number]['id']

function NamePanel() {
  const [surname, setSurname] = useState('やまだ')
  const [given, setGiven] = useState('たろう')
  const [style, setStyle] = useState<NameStyle>('passport')
  const [passportN, setPassportN] = useState(true)

  const romaji = useMemo(() => {
    const opts = { nBeforeBmpAsM: passportN, apostropheN: style !== 'passport' }
    const s = kanaToRomaji(surname, opts)
    const g = kanaToRomaji(given, opts)
    const [first, second] = style === 'given' ? [g, s] : [s, g]
    const a = titleCaseRomaji(first)
    const b = titleCaseRomaji(second)
    if (style === 'passport') return [a.toUpperCase(), b.toUpperCase()].filter(Boolean).join(' ')
    if (style === 'official') return [a.toUpperCase(), b].filter(Boolean).join(' ')
    return [a, b].filter(Boolean).join(' ')
  }, [surname, given, style, passportN])

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="surname" className="text-sm font-medium">姓（フリガナ）</Label>
          <Input
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="ヤマダ"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="given" className="text-sm font-medium">名（フリガナ）</Label>
          <Input
            id="given"
            value={given}
            onChange={(e) => setGiven(e.target.value)}
            placeholder="タロウ"
            className="mt-2"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        漢字の読みは人によって変わるため、フリガナを入力してください（例：東 = Azuma / Higashi）。
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ToggleGroup
          value={[style]}
          onValueChange={(v) => { if (v[0]) setStyle(v[0] as NameStyle) }}
          className="flex-wrap"
        >
          {NAME_STYLES.map((s) => (
            <ToggleGroupItem key={s.id} value={s.id} className="px-2.5 text-xs">
              {s.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={passportN} onCheckedChange={setPassportN} aria-label="パスポート式のん" />
          ん を m にする（Namba / Homma）
        </label>
      </div>

      <Card variant="plate" className="mt-4 gap-3 p-4">
        <p className="text-xs font-medium text-muted-foreground">ローマ字表記</p>
        <p className="font-mono text-2xl tracking-wide text-foreground">{romaji || '—'}</p>
        <Separator />
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={romaji} label="コピー" />
          <span className="text-xs text-muted-foreground">
            パスポートは姓名とも大文字（YAMADA TARO）。公用文は姓だけ大文字（YAMADA Taro）。
          </span>
        </div>
      </Card>
    </div>
  )
}
