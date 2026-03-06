import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSavingsStore } from '../../stores/savingsStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useEquipmentStore } from '../../stores/equipmentStore'
import { useGameStore } from '../../stores/gameStore'
import { useSpellStore } from '../../stores/spellStore'
import { usePetStore } from '../../stores/petStore'
import { useMercenaryStore } from '../../stores/mercenaryStore'
import { ZONES } from '../../data/zones'
import { isZoneUnlocked, getEncounterEnemy } from '../../engine/zones'

/**
 * Prestige event: simulates a monthly vesting arriving.
 * 1. Balance grows (monthly contribution + interest)
 * 2. Character level recalculates from new balance
 * 3. Combat encounter resets to 1 in current zone (prestige reset)
 * 4. Non-legendary gear is cleared (legendary persists)
 * 5. Check for new zone unlocks + spell/pet/merc unlocks from cleared zones
 * 6. New enemy spawns at encounter 1
 */
export function SkipMonthButton() {
  const simulateTick = useSavingsStore((s) => s.simulateTick)
  const monthlyContribution = useSavingsStore((s) => s.monthlyContribution)
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const recalculate = useCharacterStore((s) => s.recalculate)
  const prestigeReset = useEquipmentStore((s) => s.prestigeReset)
  const highestStage = useEquipmentStore((s) => s.highestStage)
  const spawnEnemy = useGameStore((s) => s.spawnEnemy)

  const [prestigeLevel, setPrestigeLevel] = useState<number | null>(null)
  const [newZone, setNewZone] = useState<string | null>(null)

  const handlePrestige = () => {
    const prevMonths = useSavingsStore.getState().simulatedMonths

    // 1. Add monthly vesting to balance
    simulateTick()
    const { balance, products, simulatedMonths: newMonths } = useSavingsStore.getState()

    // 2. Recalculate character from new balance
    recalculate(balance, products)
    const newLevel = useCharacterStore.getState().level

    // 3. Check for new zone unlocks
    const newlyUnlockedZones = ZONES.filter(
      (z) => !isZoneUnlocked(z.id, prevMonths) && isZoneUnlocked(z.id, newMonths)
    )

    // 4. Unlock spells/pets from previously cleared zones
    const { zoneProgress } = useEquipmentStore.getState()
    for (const zone of ZONES) {
      if (!isZoneUnlocked(zone.id, newMonths)) continue
      const progress = zoneProgress[zone.id]
      if (!progress?.cleared) continue
      if (zone.spellUnlock) useSpellStore.getState().unlockSpell(zone.spellUnlock)
      if (zone.petUnlock) usePetStore.getState().unlockPet(zone.petUnlock)
    }

    // 4b. Auto-unlock party slot 2 on first vesting
    const mercState = useMercenaryStore.getState()
    if (mercState.unlockedSlots === 1 && newMonths >= 1) {
      useMercenaryStore.getState().unlockPartySlot()
    }

    // 5. Prestige: reset encounter, keep zone progress, clear non-legendary gear
    prestigeReset()

    // 6. Spawn fresh enemy at encounter 1 in current zone
    const eqState = useEquipmentStore.getState()
    const zone = ZONES.find((z) => z.id === eqState.currentZoneId)
    if (zone) {
      const enemy = getEncounterEnemy(zone, eqState.encounterSequence, 1)
      const charLvl = useCharacterStore.getState().level
      spawnEnemy(zone, enemy, charLvl)
    }

    // 7. Show celebration
    setPrestigeLevel(newLevel)
    if (newlyUnlockedZones.length > 0) {
      setNewZone(newlyUnlockedZones[0].name)
    }
    setTimeout(() => {
      setPrestigeLevel(null)
      setNewZone(null)
    }, 3000)
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
            className="absolute inset-0 z-30 flex items-center justify-center bg-rpg-bg rounded-lg border-2 border-gold overflow-hidden px-2"
          >
            <div className="text-center max-w-full">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-3xl mb-1"
              >
                {newZone ? '🗺️' : '✨'}
              </motion.div>
              <div className="font-pixel text-[9px] text-gold truncate">
                {newZone ? 'NEUE ZONE!' : 'AUFSTIEG!'}
              </div>
              {newZone && (
                <div className="font-pixel text-[7px] text-green-400 mt-0.5 truncate">
                  {newZone} freigeschaltet!
                </div>
              )}
              <div className="font-pixel text-[6px] text-rpg-muted mt-0.5">
                +€{monthlyContribution} investiert
              </div>
              <div className="font-pixel text-[6px] text-rpg-accent mt-0.5">
                Lv.{prestigeLevel} — Reset
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
