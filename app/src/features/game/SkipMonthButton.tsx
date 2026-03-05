import { useSavingsStore } from '../../stores/savingsStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useGameStore } from '../../stores/gameStore'

/**
 * MVP dev tool: simulates a monthly vesting arriving.
 * In production this would be triggered by real bank data.
 * When vesting hits: balance grows → level recalculates → enemy difficulty scales.
 */
export function SkipMonthButton() {
  const simulateTick = useSavingsStore((s) => s.simulateTick)
  const recalculate = useCharacterStore((s) => s.recalculate)
  const spawnEnemy = useGameStore((s) => s.spawnEnemy)

  const handleSkipMonth = () => {
    simulateTick()
    const { balance, products } = useSavingsStore.getState()
    recalculate(balance, products)
    // Respawn enemy at new level so difficulty adjusts
    const newLevel = useCharacterStore.getState().level
    spawnEnemy(newLevel)
  }

  return (
    <button
      onClick={handleSkipMonth}
      className="w-full py-2 bg-rpg-panel border border-rpg-border rounded-lg font-pixel text-[9px] text-rpg-muted cursor-pointer hover:border-gold/50 hover:text-gold transition-colors"
    >
      ⏩ Monat überspringen (Sparrate einzahlen)
    </button>
  )
}
