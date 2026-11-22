import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircleLinearIcon, CopyLinearIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
}

export function CopyButton({ text, label = 'コピー', className, variant = 'outline' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={copy}
      className={cn('gap-1.5', className)}
      aria-label={`${label}：${text}`}
    >
      {copied ? (
        <CheckCircleLinearIcon className="size-4" aria-hidden="true" />
      ) : (
        <CopyLinearIcon className="size-4" aria-hidden="true" />
      )}
      <span>{copied ? 'コピーしました' : label}</span>
    </Button>
  )
}
