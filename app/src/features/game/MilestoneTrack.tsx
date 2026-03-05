import { useSavingsStore } from '../../stores/savingsStore'
import { MILESTONES } from '../../engine/milestones'
import { MilestoneChip } from '../../components/MilestoneChip'

export function MilestoneTrack() {
  const balance = useSavingsStore((s) => s.balance)

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {MILESTONES.map((m) => (
        <MilestoneChip key={m.threshold} milestone={m} unlocked={balance >= m.threshold} />
      ))}
    </div>
  )
}
