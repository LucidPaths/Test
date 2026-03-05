import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSavingsStore } from '../../stores/savingsStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useEquipmentStore } from '../../stores/equipmentStore'
import { useGameStore } from '../../stores/gameStore'

/**
 * MVP dev tool: simulates a monthly vesting arriving.
 * This is the PRESTIGE EVENT:
 * 1. Balance grows (monthly contribution + interest)
 * 2. Character level recalculates from new balance
 * 3. Combat stage resets to 1 (prestige reset)
 * 4. Non-legendary gear is cleared (legendary persists)
 * 5. New enemy spawns at stage 1
 * 6. Player replays early content at higher power = dopamine rush
 */
export function SkipMonthButton() {
  const simulateTick = useSavingsStore((s) => s.simulateTick)
  const monthlyContribution = useSavingsStore((s) => s.monthlyContribution)
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const recalculate = useCharacterStore((s) => s.recalculate)
  const level = useCharacterStore((s) => s.level)
  const prestigeReset = useEquipmentStore((s) => s.prestigeReset)
  const highestStage = useEquipmentStore((s) => s.highestStage)
  const spawnEnemy = useGameStore((s) => s.spawnEnemy)

  const [prestigeLevel, setPrestigeLevel] = useState<number | null>(null)

  const handlePrestige = () => {
    // 1. Add monthly vesting to balance
    simulateTick()
    const { balance, products } = useSavingsStore.getState()

    // 2. Recalculate character from new balance
    recalculate(balance, products)
    const newLevel = useCharacterStore.getState().level

    // 3. Prestige: reset combat stage, keep legendary gear
    prestigeReset()

    // 4. Spawn fresh enemy at stage 1
    spawnEnemy(1)

    // 5. Show prestige celebration with the new level
    setPrestigeLevel(newLevel)
    setTimeout(() => setPrestigeLevel(null), 3000)
  }

  return (
    <div className="relative">
      <button
        onClick={handlePrestige}
        className="w-full py-2.5 bg-rpg-panel border border-gold/30 rounded-lg font-pixel text-[9px] text-gold cursor-pointer hover:bg-gold/10 hover:border-gold/60 transition-colors"
      >
        ⏩ Monat überspringen — €{monthlyContribution} einzahlen
        <span className="block text-[7px] text-rpg-muted mt-0.5">
          Monat {simulatedMonths + 1} | Höchste Stufe: {highestStage}
        </span>
      </button>

      {/* Prestige celebration overlay */}
      <AnimatePresence>
        {prestigeLevel !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-rpg-bg/90 rounded-lg border-2 border-gold"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-4xl mb-2"
              >
                ✨
              </motion.div>
              <div className="font-pixel text-[10px] text-gold">AUFSTIEG!</div>
              <div className="font-pixel text-[7px] text-rpg-muted mt-1">
                +€{monthlyContribution} investiert
              </div>
              <div className="font-pixel text-[7px] text-rpg-accent mt-0.5">
                Lv.{prestigeLevel} — Stufe zurückgesetzt
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
