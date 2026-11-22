import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'ツール', end: true },
  { to: '/guide/amazon', label: '使い方' },
  { to: '/batch', label: '一括変換' },
  { to: '/pricing', label: '料金' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
        <Link to="/" className="group flex items-baseline gap-2" aria-label="住所レンズ ホーム">
          <span className="font-serif text-[1.15rem] leading-none tracking-tight text-foreground">
            住所レンズ
          </span>
          <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Jusho Lens
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5" aria-label="メイン">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-2.5 py-1.5 text-sm transition-colors duration-fast',
                  isActive
                    ? 'bg-card font-medium text-foreground shadow-(--pill-edge)'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
