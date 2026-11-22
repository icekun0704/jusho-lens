import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CheckCircleLinearIcon, LockKeyholeMinimalisticLinearIcon } from '@/components/icons'
import { config } from '@/config'
import { useLicense } from '@/lib/use-license'

const FREE = [
  '1件ずつの住所変換（無制限）',
  '英語 → 日本語の逆変換',
  '用途別フォーマット（国際郵便・Amazon・Wise・DS-160・カード）',
  '氏名のローマ字変換（パスポート式）',
  '入力内容の検証',
]

const PRO = [
  'CSV一括変換（1ファイル 1,000 件まで）',
  '一括検証と「要確認」の抽出',
  '変換履歴の保存',
  '広告なし',
  '辞書更新の優先案内',
]

export function PricingPage() {
  const { info, pro, activate, deactivate } = useLicense()
  const [token, setToken] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')

  async function onActivate() {
    if (!token.trim()) return
    setState('checking')
    const result = await activate(token)
    setState(result ? 'ok' : 'error')
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-serif text-3xl tracking-tight">料金</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        1件ずつの変換は無料です。まとめて処理するときだけ Pro を購入してください。買い切りで、追加の課金はありません。
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">無料</h2>
            <Badge variant="secondary">登録不要</Badge>
          </div>
          <p className="mt-3 font-serif text-3xl">¥0</p>
          <p className="mt-1 text-xs text-muted-foreground">個人利用・試用</p>
          <Separator className="my-5" />
          <ul className="space-y-2.5 text-sm">
            {FREE.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircleLinearIcon className="mt-0.5 size-4 shrink-0 text-(--success-text)" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="featured" className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Pro</h2>
            <Badge variant="primary">買い切り</Badge>
          </div>
          <p className="mt-3 font-serif text-3xl">
            ¥2,980 <span className="text-sm font-normal text-muted-foreground">（税込）</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">1アカウント・端末数の制限なし</p>
          <Separator className="my-5" />
          <ul className="space-y-2.5 text-sm">
            {PRO.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircleLinearIcon className="mt-0.5 size-4 shrink-0 text-(--success-text)" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {config.purchaseUrl ? (
              <Button asChild className="w-full">
                <a href={config.purchaseUrl} target="_blank" rel="noreferrer">
                  購入する
                </a>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                販売準備中
              </Button>
            )}
            <p className="mt-2 text-center text-xs text-muted-foreground">
              購入後に届くライセンスキーを、下の欄に入力してください。
            </p>
          </div>
        </Card>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-xl tracking-tight">ライセンスの有効化</h2>
        {pro ? (
          <Card variant="plate" className="mt-4 gap-3 p-5">
            <p className="flex items-center gap-2 text-sm">
              <LockKeyholeMinimalisticLinearIcon className="size-4 text-(--success-text)" aria-hidden="true" />
              Pro が有効です{info?.email ? `（${info.email}）` : ''}
            </p>
            <div>
              <Button variant="outline" size="sm" onClick={deactivate}>
                この端末で無効にする
              </Button>
            </div>
          </Card>
        ) : (
          <Card variant="plate" className="mt-4 gap-3 p-5">
            <Label htmlFor="license" className="text-sm">
              ライセンスキー
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="license"
                value={token}
                onChange={(e) => { setToken(e.target.value); setState('idle') }}
                placeholder="xxxxxxxx.xxxxxxxx"
                className="font-mono text-xs"
                spellCheck={false}
              />
              <Button onClick={onActivate} disabled={state === 'checking' || !token.trim()}>
                {state === 'checking' ? '確認中…' : '有効化'}
              </Button>
            </div>
            {state === 'ok' && <p className="text-sm text-(--success-text)">有効化しました。</p>}
            {state === 'error' && <p className="text-sm text-(--destructive-text)">キーを確認できませんでした。</p>}
            <p className="text-xs leading-relaxed text-muted-foreground">
              キーはこの端末にのみ保存され、署名はブラウザ内で検証されます。サーバーへの送信はありません。
            </p>
          </Card>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl tracking-tight">法人利用</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          社内での一括導入、オフライン配布、請求書払い、社内規定に合わせた免責文の調整に対応します。
          {config.contactEmail ? (
            <>
              {' '}
              <a className="underline underline-offset-4" href={`mailto:${config.contactEmail}`}>
                {config.contactEmail}
              </a>
              までご連絡ください。
            </>
          ) : (
            ' 連絡先は準備中です。'
          )}
        </p>
      </section>
    </div>
  )
}
