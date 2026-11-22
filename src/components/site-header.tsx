import { NavLink } from 'react-router-dom'
import { config } from '@/config'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'ツール', end: true },
  { to: '/guide/amazon', label: '使い方' },
  { to: '/batch', label: '一括変換', mobileHidden: true },
  { to: '/pricing', label: '料金' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-6 sm:px-5">
        <a href={config.hubUrl} className="flex shrink-0 items-baseline gap-2 whitespace-nowrap" aria-label="道具箱トップへ">
          <span className="font-serif text-[1.02rem] leading-none tracking-tight text-foreground sm:text-[1.15rem]">
            住所レンズ
          </span>
          <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Jusho Lens
          </span>
        </a>

        <nav className="ml-auto flex min-w-0 items-center gap-0.5" aria-label="メイン">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-md px-2 py-1.5 text-[13px] transition-colors duration-fast sm:px-2.5 sm:text-sm',
                  item.mobileHidden && 'hidden sm:inline-flex',
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
