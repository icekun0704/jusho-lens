import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircleLinearIcon } from '@/components/icons'
import { config } from '@/config'

const FEATURES = [
  '住所の逆引き（英語 → 日本語）と使い方の確認',
  '日本語 → 英語（国際郵便・Amazon US・Wise・DS-160・カード）',
  '郵便番号から住所を引く',
  '氏名のローマ字（パスポート式・公用文式）',
  'CSV一括変換（1ファイル 1,000 件まで）',
  '登録不要・入力は送信されません',
]

export function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-serif text-3xl tracking-tight">料金</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        すべて無料です。運営費はページの広告で賄っています。アカウントも、課金も、上限もありません。
      </p>

      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">無料</h2>
          <Badge variant="secondary">全機能</Badge>
        </div>
        <p className="mt-3 font-serif text-3xl">
          ¥0 <span className="text-sm font-normal text-muted-foreground">ずっと</span>
        </p>
        <Separator className="my-5" />
        <ul className="space-y-2.5 text-sm">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckCircleLinearIcon className="mt-0.5 size-4 shrink-0 text-(--success-text)" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Card>

      <section className="mt-10">
        <h2 className="font-serif text-xl tracking-tight">運営について</h2>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            サーバー代を広告で賄う構成にしています。広告を消すための有料プランは用意していません。広告ブロッカーを使っていても、機能は変わりません。
          </p>
          <p>
            住所データは日本郵便が公開している郵便番号データから生成しています。入力した住所・氏名・CSVはブラウザの外に出ません。
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl tracking-tight">広告について</h2>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {config.adsenseClient ? (
            <p>
              Google AdSense を利用しています。広告の配信のために Cookie が使われることがあります。詳しくは
              <a className="mx-1 underline underline-offset-4" href="#/legal/privacy">
                プライバシーポリシー
              </a>
              をご覧ください。
            </p>
          ) : (
            <p>現在、広告は表示していません。表示を開始するときに、このページで告知します。</p>
          )}
          {config.contactEmail && (
            <p>
              広告の掲載に関するお問い合わせ：
              <a className="ml-1 underline underline-offset-4" href={`mailto:${config.contactEmail}`}>
                {config.contactEmail}
              </a>
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
