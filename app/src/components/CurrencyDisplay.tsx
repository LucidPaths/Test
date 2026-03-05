import { useEffect, useRef, useState } from 'react'

interface CurrencyDisplayProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export function CurrencyDisplay({ amount, size = 'md', animate = true }: CurrencyDisplayProps) {
  const [display, setDisplay] = useState(amount)
  const rafRef = useRef<number>(0)
  const prevRef = useRef(amount)

  useEffect(() => {
    if (!animate) {
      setDisplay(amount)
      return
    }

    const start = prevRef.current
    const diff = amount - start
    const duration = 300
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(start + diff * eased)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        prevRef.current = amount
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [amount, animate])

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
  }

  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(display)

  return <span className={`font-pixel text-gold ${sizeClasses[size]}`}>{formatted}</span>
}
