import { useEffect } from 'react'
import { config } from '@/config'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

let scriptRequested = false

/**
 * A labelled AdSense unit. Renders nothing until `config.adsenseClient` and a
 * slot id are set, so the site works without an ad account.
 */
export function AdSlot({ slot = config.adsenseSlot, className }: { slot?: string; className?: string }) {
  useEffect(() => {
    if (!config.adsenseClient || !slot) return
    if (!scriptRequested) {
      scriptRequested = true
      const script = document.createElement('script')
      script.async = true
      script.crossOrigin = 'anonymous'
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClient}`
      document.head.appendChild(script)
    }
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* the script has not finished loading yet */
    }
  }, [slot])

  if (!config.adsenseClient || !slot) return null

  return (
    <aside aria-label="広告" className={cn('my-10', className)}>
      <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">広告</p>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={config.adsenseClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
