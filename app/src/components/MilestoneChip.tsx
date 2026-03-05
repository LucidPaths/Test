import type { Milestone } from '../engine/milestones'

interface MilestoneChipProps {
  milestone: Milestone
  unlocked: boolean
}

export function MilestoneChip({ milestone, unlocked }: MilestoneChipProps) {
  return (
    <div
      className={`flex flex-col items-center gap-1 px-2 py-1 rounded transition-all ${
        unlocked
          ? 'animate-pulse-glow bg-rpg-panel border border-gold/50'
          : 'bg-rpg-panel/50 border border-rpg-border opacity-40 grayscale'
      }`}
    >
      <span className="text-lg">{milestone.icon}</span>
      <span className="text-[7px] font-pixel text-center leading-tight">
        {unlocked ? milestone.name : `€${milestone.threshold.toLocaleString('de-DE')}`}
      </span>
    </div>
  )
}
