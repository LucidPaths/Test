import { useEffect, useRef } from 'react'
import { CompoundCurve } from './CompoundCurve'
import { LevelArena } from './LevelArena'
import { CharacterPanel } from './CharacterPanel'
import { MicroSaveAction } from './MicroSaveAction'
import { MilestoneTrack } from './MilestoneTrack'
import { useSavingsStore } from '../../stores/savingsStore'
import { useCharacterStore } from '../../stores/characterStore'

/**
 * Savings simulation runs independently from combat.
 * Balance grows from monthly contributions + interest on a timer,
 * then character stats are recalculated from the new balance.
 */
function useSavingsSimulation() {
  const simulateTick = useSavingsStore((s) => s.simulateTick)
  const products = useSavingsStore((s) => s.products)
  const recalculate = useCharacterStore((s) => s.recalculate)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      simulateTick()
      const newBalance = useSavingsStore.getState().balance
      const currentProducts = useSavingsStore.getState().products
      recalculate(newBalance, currentProducts)
    }, 3000) // 1 simulated month every 3 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [simulateTick, recalculate])
}

export function GameView() {
  useSavingsSimulation()

  return (
    <div className="flex flex-col gap-3 p-3">
      <CompoundCurve />
      <MilestoneTrack />
      <LevelArena />
      <CharacterPanel />
      <MicroSaveAction />
    </div>
  )
}
