interface StatBadgeProps {
  label: string
  value: number | string
  icon?: string
}

export function StatBadge({ label, value, icon }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-1 bg-rpg-panel border border-rpg-border rounded px-2 py-1">
      {icon && <span className="text-sm">{icon}</span>}
      <span className="text-[8px] font-pixel text-rpg-muted uppercase">{label}</span>
      <span className="text-[10px] font-pixel text-rpg-text">{value}</span>
    </div>
  )
}
