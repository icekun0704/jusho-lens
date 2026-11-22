import { Link } from 'react-router-dom'
import { focusRing } from '@/components/ui/_shared'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/guide/amazon', label: 'Amazonの英語住所' },
  { to: '/guide/wise', label: 'Wiseの住所' },
  { to: '/guide/ds160', label: 'DS-160の住所' },
  { to: '/pricing', label: '料金' },
  { to: '/legal/privacy', label: 'プライバシー' },
  { to: '/legal/terms', label: '利用規約' },
  { href: 'https://icekun.net/#contact', label: 'お問い合わせ' },
]

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg tracking-tight">住所レンズ</span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                Jusho Lens
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              日本の住所を英語に、英語の住所を日本語に。変換はすべてブラウザ内で完結し、入力した住所は送信されません。
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-1 text-sm" aria-label="フッター">
            {LINKS.map((l) =>
              'href' in l && l.href ? (
                <a
                  key={l.href}
                  href={l.href}
                  className={cn('inline-flex min-h-11 items-center rounded-sm text-muted-foreground hover:text-foreground', focusRing)}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.to}
                  to={l.to as string}
                  className={cn('inline-flex min-h-11 items-center rounded-sm text-muted-foreground hover:text-foreground', focusRing)}
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
          <p>
            住所データは日本郵便の郵便番号データ（2026年10月30日更新）をもとにしています。本サービスは日本郵便とは関係ありません。
          </p>
          <p className="mt-1">© 2026 住所レンズ</p>
        </div>
      </div>
    </footer>
  )
}
