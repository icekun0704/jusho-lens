import { useParams } from 'react-router-dom'
import { config } from '@/config'

const PRIVACY = [
  {
    h: '入力した住所の扱い',
    p: [
      '住所・氏名・CSVの内容は、すべてブラウザ内で処理します。変換のために外部のサーバーへ送信することはありません。',
    ],
  },
  {
    h: '読み込むデータ',
    p: [
      '住所辞書（都道府県・市区町村・町域）とアプリ本体を、静的ファイルとして配信元から読み込みます。入力内容は含まれません。',
    ],
  },
  {
    h: '端末に保存するもの',
    p: [
      '入力した住所・氏名・CSVは保存しません。ページを閉じると消えます。Cookie は、広告を表示する場合に限り Google が使用することがあります。',
    ],
  },
  {
    h: '広告',
    p: [
      'ページの運営費を賄うため、Google AdSense による広告を掲載する場合があります。広告の配信には Cookie が使われることがあります。アクセス解析ツールは導入していません。',
    ],
  },
  {
    h: 'お問い合わせ',
    p: [
      config.contactEmail
        ? `プライバシーに関するお問い合わせは ${config.contactEmail} までご連絡ください。`
        : 'プライバシーに関するお問い合わせ先は準備中です。',
    ],
  },
]

const TERMS = [
  {
    h: 'サービス内容',
    p: [
      '本サービスは、日本の住所・氏名を英語表記に変換し、また英語表記から日本語の住所を推定するツールです。変換結果は参考情報であり、正確性・完全性を保証しません。',
    ],
  },
  {
    h: '免責',
    p: [
      '本サービスの利用によって生じた配送の遅延・不到着、申請の不受理、送金の不備、その他の損害について、運営者は責任を負いません。重要な手続きでは、必ず公式の窓口や申請先の指示を確認してください。',
    ],
  },
  {
    h: 'データの出典',
    p: [
      '住所データは日本郵便が公開する郵便番号データをもとにしています。本サービスは日本郵便、Amazon、Wise、米国政府その他の第三者と提携・関係していません。',
    ],
  },
  {
    h: '料金',
    p: [
      '本サービスは無料です。運営費はページに掲載する広告で賄います。有料プランはありません。',
    ],
  },
  {
    h: '禁止事項',
    p: [
      '本サービスを、法令に違反する目的、第三者になりすます目的、または本サービスの運営を妨げる目的で利用してはなりません。',
    ],
  },
  {
    h: '変更',
    p: ['内容は予告なく変更することがあります。重要な変更はこのページで告知します。'],
  },
]

export function LegalPage() {
  const { kind } = useParams<{ kind: string }>()
  const isPrivacy = kind === 'privacy'
  const sections = isPrivacy ? PRIVACY : TERMS
  const title = isPrivacy ? 'プライバシーポリシー' : '利用規約'

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
      <p className="mt-2 text-xs text-muted-foreground">最終更新：2026年11月</p>
      <div className="mt-8 space-y-7">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-serif text-xl tracking-tight">{s.h}</h2>
            {s.p.map((p) => (
              <p key={p} className="mt-2 text-sm leading-relaxed text-foreground/85">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
