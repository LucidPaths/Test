import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MERCENARIES, getMercById } from '../../data/mercenaries'
import { useMercenaryStore } from '../../stores/mercenaryStore'
import { useGameStore } from '../../stores/gameStore'
import { useEquipmentStore } from '../../stores/equipmentStore'
import { useSavingsStore } from '../../stores/savingsStore'
import { isZoneUnlocked } from '../../engine/zones'

interface KaserneProps {
  onBack: () => void
}

export function Kaserne({ onBack }: KaserneProps) {
  const recruitedIds = useMercenaryStore((s) => s.recruitedIds)
  const partySlots = useMercenaryStore((s) => s.partySlots)
  const combatTokens = useGameStore((s) => s.combatTokens)
  const zoneProgress = useEquipmentStore((s) => s.zoneProgress)
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const [result, setResult] = useState<string | null>(null)

  const handleRecruit = (mercId: string, cost: number) => {
    const success = useMercenaryStore.getState().recruit(mercId, cost)
    if (success) {
      setResult(`✅ ${getMercById(mercId)?.name} rekrutiert!`)
    } else {
      setResult('❌ Nicht genug Tokens!')
    }
    setTimeout(() => setResult(null), 2000)
  }

  const handleAddToParty = (mercId: string) => {
    useMercenaryStore.getState().addToParty(mercId)
  }

  const handleRemoveFromParty = (slotIndex: number) => {
    useMercenaryStore.getState().removeFromParty(slotIndex)
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="font-pixel text-[9px] text-rpg-muted cursor-pointer hover:text-gold">← Zurück</button>
        <h2 className="font-pixel text-[10px] text-gold flex-1 text-center">🏰 Kaserne</h2>
      </div>

      <p className="font-pixel text-[7px] text-rpg-muted text-center">
        Rekrutiere Söldner für deine Gruppe. 🪙 {combatTokens}
      </p>

      {/* Party slots */}
      <div className="bg-rpg-bg/50 rounded-lg p-2">
        <span className="font-pixel text-[7px] text-rpg-muted">Gruppe</span>
        <div className="flex gap-2 mt-1.5">
          {partySlots.map((mercId, idx) => {
            const merc = mercId ? getMercById(mercId) : null
            return (
              <div key={idx} className="flex-1 flex items-center gap-1.5 p-2 rounded-lg border border-rpg-border bg-rpg-panel min-h-[48px]">
                {merc ? (
                  <>
                    <span className="text-xl">{merc.emoji}</span>
                    <div className="flex-1">
                      <div className="font-pixel text-[7px] text-rpg-text">{merc.name}</div>
                      <div className="font-pixel text-[5px] text-green-400">DPS {merc.baseDPS}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromParty(idx)}
                      className="font-pixel text-[6px] text-rpg-accent cursor-pointer hover:text-red-400"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span className="font-pixel text-[7px] text-rpg-muted w-full text-center">Leer</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Result notification */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-pixel text-[8px] text-center text-gold"
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mercenary list */}
      <div className="flex flex-col gap-2">
        {MERCENARIES.map((merc) => {
          const zoneCleared = zoneProgress[merc.unlockZoneId]?.cleared
          const unlocked = isZoneUnlocked(merc.unlockZoneId, simulatedMonths) && zoneCleared
          const recruited = recruitedIds.includes(merc.id)
          const inParty = partySlots.includes(merc.id)

          return (
            <div
              key={merc.id}
              className={`p-3 rounded-lg border transition-all ${
                unlocked ? 'bg-rpg-panel border-rpg-border' : 'bg-rpg-panel/30 border-rpg-border/30 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-2xl ${!unlocked ? 'grayscale' : ''}`}>{merc.emoji}</span>
                <div className="flex-1">
                  <div className="font-pixel text-[8px] text-rpg-text">{merc.name}</div>
                  <div className="font-pixel text-[6px] text-rpg-muted">{merc.description}</div>
                  <div className="flex gap-2 mt-0.5">
                    <span className="font-pixel text-[6px] text-green-400">DPS {merc.baseDPS}</span>
                    <span className="font-pixel text-[6px] text-blue-400">
                      {merc.specialAbility.emoji} {merc.specialAbility.description}
                    </span>
                  </div>
                </div>

                {!unlocked && (
                  <span className="font-pixel text-[7px] text-rpg-muted">🔒</span>
                )}
                {unlocked && !recruited && (
                  <button
                    onClick={() => handleRecruit(merc.id, merc.recruitCost)}
                    disabled={combatTokens < merc.recruitCost}
                    className="font-pixel text-[7px] text-gold border border-gold/30 rounded px-2 py-1 cursor-pointer hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    🪙 {merc.recruitCost}
                  </button>
                )}
                {recruited && !inParty && (
                  <button
                    onClick={() => handleAddToParty(merc.id)}
                    className="font-pixel text-[7px] text-green-400 border border-green-400/30 rounded px-2 py-1 cursor-pointer hover:bg-green-400/10 transition-colors"
                  >
                    + Gruppe
                  </button>
                )}
                {inParty && (
                  <span className="font-pixel text-[7px] text-gold">⚔️ Aktiv</span>
                )}
              </div>

              {/* Financial lesson */}
              {recruited && (
                <div className="font-pixel text-[5px] text-rpg-muted mt-1.5 italic border-t border-rpg-border/30 pt-1">
                  💡 {merc.financialLesson}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
