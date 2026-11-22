import { Link } from 'react-router-dom'
import { AddressTool } from '@/components/address-tool'
import { ArrowRightLinearIcon, ShieldCheckLinearIcon } from '@/components/icons'
import { Separator } from '@/components/ui/separator'

const REASONS = [
  {
    n: '01',
    title: '逆変換できる',
    body: '日本語から英語はどのツールでもできます。難しいのは逆。英語の住所を都道府県・市区町村・町名・番地に分解し、元の住所と一致するかを返します。',
  },
  {
    n: '02',
    title: '提出先の欄名で出る',
    body: 'Amazon US、Wise、DS-160、国際郵便。フォームごとに Address Line 1 / City / State の分け方が違うので、欄名のまま出力し、日本語の残りや文字数を検査します。',
  },
  {
    n: '03',
    title: '読みを辞書で引く',
    body: '日本郵便の郵便番号データから作った 119,051 町域の読みを使います。長音（Tokyo）・促音（Hatcho）・撥音まで、地名の慣用表記に合わせます。',
  },
]

const SCENES = [
  {
    to: '/guide/amazon',
    title: 'Amazonの英語住所',
    body: '海外発送で求められる英語表記が、自動翻訳のままで正しいか確認する。',
  },
  {
    to: '/guide/wise',
    title: 'Wise・海外送金',
    body: '登録住所を本人確認書類と一致させ、審査で止まらないようにする。',
  },
  {
    to: '/guide/ds160',
    title: 'DS-160・ビザ',
    body: '住所を欄ごとに分け、ラテン文字だけで入力する。',
  },
  {
    to: '/batch',
    title: 'CSV一括変換',
    body: '越境ECや通関の出荷先を、まとめて英語表記にする。',
  },
]

const FAQ = [
  {
    q: '入力した住所は送信されますか',
    a: 'いいえ。変換はすべてブラウザ内で完結します。読み込むのは住所辞書の静的ファイルだけで、入力した住所が外部に送られることはありません。',
  },
  {
    q: '無料で使えますか',
    a: '1件ずつの変換は無料です。CSVの一括変換と一括検証は Pro（買い切り）に含まれます。',
  },
  {
    q: '建物名が漢字だと変換できないのはなぜですか',
    a: '「渋谷ビル」の読みは「しぶや」と「しぶや」以外にも取り得て、機械では確定できないためです。カタカナの建物名は自動変換し、漢字の場合はローマ字を入力する欄を出します。',
  },
  {
    q: 'データの出典は',
    a: '日本郵便が公開している郵便番号データ（2026年10月30日更新）をもとに、読みと英語表記を生成しています。日本郵便とは関係ありません。',
  },
  {
    q: '変換結果がそのまま使えますか',
    a: '参考情報としてお使いください。重要な書類や配送は、必ず公式の窓口・追跡・申請先の指示で最終確認してください。',
  },
]

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="grid gap-10 py-10 lg:grid-cols-2 lg:items-start lg:py-14">
        <div className="lg:pt-1">
          <h1 className="font-serif text-[1.9rem] leading-[1.24] tracking-tight text-foreground sm:text-[2.3rem]">
            その英語住所、
            <br />
            日本の住所に戻せますか。
          </h1>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
            Amazonの自動翻訳、Wiseの登録住所、ビザの申請書。英語の住所を貼り付けると、元の日本の住所と一致度を返します。
          </p>

          <ul className="mt-7 space-y-2.5 text-sm text-foreground/85">
            <li className="flex items-start gap-2">
              <ShieldCheckLinearIcon className="mt-0.5 size-4 shrink-0 text-(--primary-text)" aria-hidden="true" />
              入力した住所はブラウザの外に出ません
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheckLinearIcon className="mt-0.5 size-4 shrink-0 text-(--primary-text)" aria-hidden="true" />
              日本郵便の公式データから作った 119,051 町域の辞書
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheckLinearIcon className="mt-0.5 size-4 shrink-0 text-(--primary-text)" aria-hidden="true" />
              登録不要・1件ずつは無料
            </li>
          </ul>
        </div>

        <AddressTool />
      </section>

      <Separator />

      <section className="py-12">
        <h2 className="font-serif text-2xl tracking-tight">変換より、確認。</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          英語表記は検索すればいくらでも出てきます。足りないのは、その表記が本当に自分の住所を指しているかという確認です。
        </p>

        <div className="mt-8 divide-y divide-border border-y border-border">
          {REASONS.map((r) => (
            <div key={r.n} className="grid gap-3 py-6 sm:grid-cols-[4rem_minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
              <span className="font-mono text-xs text-muted-foreground">{r.n}</span>
              <h3 className="text-[0.95rem] font-medium">{r.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <h2 className="font-serif text-2xl tracking-tight">よくある場面</h2>
        <div className="mt-6 grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {SCENES.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group flex items-start justify-between gap-4 border-t border-border py-4"
            >
              <span>
                <span className="block text-[0.95rem] font-medium text-foreground">{s.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{s.body}</span>
              </span>
              <ArrowRightLinearIcon
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-fast group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="py-12">
        <h2 className="font-serif text-2xl tracking-tight">よくある質問</h2>
        <dl className="mt-6 divide-y divide-border border-t border-border">
          {FAQ.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="text-[0.95rem] font-medium">{item.q}</dt>
              <dd className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-4 rounded-xl border border-border bg-secondary/50 px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl tracking-tight">まず、1件を戻してみてください。</h2>
            <p className="mt-1 text-sm text-muted-foreground">登録も、アップロードも要りません。</p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            ツールへ戻る
          </button>
        </div>
      </section>
    </div>
  )
}
