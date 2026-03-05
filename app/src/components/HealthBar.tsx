interface HealthBarProps {
  current: number
  max: number
  color?: string
  label?: string
  showNumbers?: boolean
  height?: string
}

export function HealthBar({
  current,
  max,
  color = 'bg-hp-red',
  label,
  showNumbers = true,
  height = 'h-4',
}: HealthBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-[10px] font-pixel mb-1">
          <span>{label}</span>
          {showNumbers && (
            <span>
              {Math.floor(current)}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={`${height} w-full rounded-sm overflow-hidden border border-white/20`}
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        <div
          className={`h-full ${color} transition-all duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
