import { useParams } from 'react-router-dom'

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
      'ライセンスキーと、Pro の有効状態を localStorage に保存します。変換履歴は保存しません（Pro の履歴機能を有効にした場合を除く）。',
    ],
  },
  {
    h: 'アクセス解析と広告',
    p: [
      '現在、アクセス解析と広告は導入していません。導入する場合は、このページで種類と目的を告知します。',
    ],
  },
  {
    h: '削除',
    p: ['ブラウザのサイトデータを削除すると、保存されたライセンス情報も消えます。'],
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
    h: 'ライセンス',
    p: [
      'Pro ライセンスは買い切りで、購入した本人が利用できます。端末数の制限は設けていません。ライセンスキーの再配布・転売は禁止します。',
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
