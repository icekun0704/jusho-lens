import { Link, useParams } from 'react-router-dom'
import { AddressTool } from '@/components/address-tool'
import { ArrowRightLinearIcon } from '@/components/icons'

interface Section {
  h: string
  p?: string[]
  ul?: string[]
  pre?: string
  dl?: [string, string][]
}

interface Guide {
  title: string
  description: string
  sections: Section[]
}

const GUIDES: Record<string, Guide> = {
  amazon: {
    title: 'Amazonの英語住所を確認する',
    description:
      '海外発送で表示される英語表記が、登録している住所と一致しているかを確かめる手順です。',
    sections: [
      {
        h: 'なぜ英語表記を求められるのか',
        p: [
          'Amazon.co.jpでも、海外の倉庫から発送される商品は、配送先を英語で扱うことがあります。日本語の住所をそのまま渡せないため、Amazonが自動で翻訳した住所の確認を求められます。',
          '自動翻訳は住所の構造を知らないまま行われるので、町名が直訳されたり、丁目の順序が入れ替わったりします。',
        ],
      },
      {
        h: '確認の手順',
        ul: [
          'Amazonに表示された英語住所をコピーする',
          '上のツールの「英語 → 日本語」に貼り付ける',
          '返ってきた日本語が、登録している住所と一致するか見る',
          '一致度が「中」「低」なら、都道府県・市区町村・町名のどこが崩れているかを確認する',
        ],
      },
      {
        h: 'よくある崩れ方',
        ul: [
          '町名が英訳される（大正区が Great True Area のようになる）',
          '丁目・番・号の順序が入れ替わる',
          '建物名・部屋番号が落ちる',
          '郵便番号が欠ける、または国名に混ざる',
        ],
      },
      {
        h: 'City欄がないとき',
        p: [
          '海外のフォームには City 欄がないものもあります。その場合は Address Line 1 に市区町村まで、Address Line 2 に建物名を入れると通ることがあります。ツールの「Amazon US」は、この分け方で出力します。',
        ],
      },
      {
        h: '注意',
        p: [
          '最終的に配送できるかはAmazonの判定です。このツールは表記の確認用で、配送を保証するものではありません。',
        ],
      },
    ],
  },
  wise: {
    title: 'Wiseに登録する住所を英語で書く',
    description:
      '本人確認書類の住所と一致させるための、日本の住所の英語表記です。',
    sections: [
      {
        h: '何を見られるのか',
        p: [
          'Wiseなどの海外フィンテックは、登録住所と本人確認書類の住所が一致しているかを見ます。表記が食い違うと、審査が止まることがあります。',
        ],
      },
      {
        h: '書く順序',
        p: ['日本の住所は、小さい単位から書きます。'],
        pre: '1-2-3 Jinnan\nShibuya-ku\nTokyo 150-0041\nJapan',
      },
      {
        h: '建物名と部屋番号',
        p: [
          '建物名は Address Line 2 に入れます。部屋番号は #402 のように書くと通ります。建物名が漢字の場合は、ツールの入力欄でローマ字に直してください。',
        ],
      },
      {
        h: '注意',
        p: [
          'アカウントの住所は、運転免許証や住民票の住所と揃えてください。引っ越した場合は、書類より先に登録住所を更新します。',
        ],
      },
    ],
  },
  ds160: {
    title: 'DS-160に日本の住所を入れる',
    description:
      '米国ビザ申請フォーム（DS-160）の住所欄に、日本の住所をどう分けて入れるか。',
    sections: [
      {
        h: '欄の対応',
        dl: [
          ['Address Line 1', '番地と町名（例：1-2-3 Jinnan）'],
          ['Address Line 2', '建物名・部屋番号'],
          ['City', '区（例：Shibuya-ku）'],
          ['State/Province', '都道府県（例：Tokyo）'],
          ['Postal Zone/Zip Code', '150-0041'],
          ['Country/Region', 'JAPAN'],
        ],
      },
      {
        h: 'ラテン文字だけ',
        p: [
          'DS-160はラテン文字で入力します。全角文字や漢字は受け付けられません。ツールの「DS-160」は、出力に日本語が残っていないかを検査します。',
        ],
      },
      {
        h: '長い建物名',
        p: [
          '欄の文字数には上限があります。長い建物名は省略するか、Address Line 2 に分けてください。ツールは40文字を超える行に警告を出します。',
        ],
      },
      {
        h: '注意',
        p: [
          '申請内容の最終確認は、公式サイトの指示に従ってください。このツールは入力の下書きを作るもので、申請の可否を判断するものではありません。',
        ],
      },
    ],
  },
}

export function GuidePage() {
  const { slug } = useParams<{ slug: string }>()
  const guide = slug ? GUIDES[slug] : undefined

  if (!guide) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-serif text-3xl tracking-tight">使い方</h1>
        <p className="mt-3 text-sm text-muted-foreground">目的別のガイドを選んでください。</p>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {Object.entries(GUIDES).map(([key, g]) => (
            <li key={key}>
              <Link to={`/guide/${key}`} className="group flex items-center justify-between gap-4 py-4">
                <span>
                  <span className="block text-[0.95rem] font-medium">{g.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{g.description}</span>
                </span>
                <ArrowRightLinearIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        <article>
          <h1 className="font-serif text-[1.9rem] leading-tight tracking-tight">{guide.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{guide.description}</p>

          <div className="mt-8 space-y-8">
            {guide.sections.map((s) => (
              <section key={s.h}>
                <h2 className="font-serif text-xl tracking-tight">{s.h}</h2>
                {s.p?.map((p) => (
                  <p key={p} className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {p}
                  </p>
                ))}
                {s.ul && (
                  <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/85">
                    {s.ul.map((li) => (
                      <li key={li} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span>{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.pre && (
                  <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-(--field) px-4 py-3 font-mono text-[13px] leading-relaxed">
                    {s.pre}
                  </pre>
                )}
                {s.dl && (
                  <dl className="mt-3 divide-y divide-border border-y border-border">
                    {s.dl.map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-3 py-2.5 text-sm">
                        <dt className="font-mono text-xs text-muted-foreground">{k}</dt>
                        <dd className="break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            ))}
          </div>

          <p className="mt-10 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            このページは一般的な入力方法の説明です。申請・送金・配送の最終的な要件は、各サービスの公式案内を確認してください。
          </p>
        </article>

        <div className="lg:sticky lg:top-20">
          <AddressTool />
        </div>
      </div>
    </div>
  )
}
