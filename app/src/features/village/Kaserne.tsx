import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MERCENARIES, getMercById, getStarterMerc } from '../../data/mercenaries'
import { useMercenaryStore } from '../../stores/mercenaryStore'
import { useGameStore } from '../../stores/gameStore'
import { useEquipmentStore } from '../../stores/equipmentStore'
import { useSavingsStore } from '../../stores/savingsStore'
import { getZoneById } from '../../data/zones'
import { MAX_PARTY_SLOTS, PARTY_SLOT_3_ZONE, PARTY_SLOT_4_ZONE } from '../../constants/gameBalances'

interface KaserneProps {
  onBack: () => void
}

export function Kaserne({ onBack }: KaserneProps) {
  const recruitedIds = useMercenaryStore((s) => s.recruitedIds)
  const partySlots = useMercenaryStore((s) => s.partySlots)
  const unlockedSlots = useMercenaryStore((s) => s.unlockedSlots)
  const combatTokens = useGameStore((s) => s.combatTokens)
  const zoneProgress = useEquipmentStore((s) => s.zoneProgress)
  const gender = useSavingsStore((s) => s.gender)
  const [result, setResult] = useState<string | null>(null)

  // Resolve starter merc based on player gender
  const resolvedMercs = MERCENARIES.map((m) =>
    m.id === 'starter-gefaehrte' ? getStarterMerc(gender) : m
  )

  const handleRecruit = (mercId: string, cost: number) => {
    const success = useMercenaryStore.getState().recruit(mercId, cost)
    if (success) {
      setResult(`✅ ${getMercById(mercId, gender)?.name} rekrutiert!`)
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

  const handleUnlockSlot3 = () => {
    useMercenaryStore.getState().unlockPartySlot()
    setResult('✅ 3. Slot freigeschaltet!')
    setTimeout(() => setResult(null), 2000)
  }

  const handleUnlockSlot4 = () => {
    // 4th slot costs €5 micro-investment
    const savings = useSavingsStore.getState()
    savings.microSave(5, 'Gruppen-Erweiterung', '🏰')
    useMercenaryStore.getState().unlockPartySlot()
    setResult('✅ 4. Slot freigeschaltet! €5 investiert!')
    setTimeout(() => setResult(null), 2000)
  }

  // Determine which locked slots to show
  const slot3Zone = getZoneById(PARTY_SLOT_3_ZONE)
  const slot4Zone = getZoneById(PARTY_SLOT_4_ZONE)
  const slot3ZoneCleared = zoneProgress[PARTY_SLOT_3_ZONE]?.cleared ?? false
  const slot4ZoneCleared = zoneProgress[PARTY_SLOT_4_ZONE]?.cleared ?? false

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
        <span className="font-pixel text-[7px] text-rpg-muted">Gruppe ({partySlots.length}/{MAX_PARTY_SLOTS})</span>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {partySlots.map((mercId, idx) => {
            const merc = mercId ? getMercById(mercId, gender) : null
            return (
              <div key={idx} className="flex-1 flex items-center gap-1.5 p-2 rounded-lg border border-rpg-border bg-rpg-panel min-h-[48px] min-w-[120px]">
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

          {/* Locked slot indicators */}
          {unlockedSlots < 3 && (
            <div className="flex-1 flex items-center justify-center p-2 rounded-lg border border-rpg-border/30 bg-rpg-panel/30 min-h-[48px] min-w-[120px]">
              {slot3ZoneCleared ? (
                <button
                  onClick={handleUnlockSlot3}
                  className="font-pixel text-[6px] text-gold cursor-pointer hover:text-gold/80"
                >
                  🔓 3. Slot freischalten
                </button>
              ) : (
                <span className="font-pixel text-[6px] text-rpg-muted">
                  🔒 {slot3Zone ? `${slot3Zone.emoji} ${slot3Zone.name}` : PARTY_SLOT_3_ZONE}
                </span>
              )}
            </div>
          )}
          {unlockedSlots < 4 && unlockedSlots >= 3 && (
            <div className="flex-1 flex items-center justify-center p-2 rounded-lg border border-rpg-border/30 bg-rpg-panel/30 min-h-[48px] min-w-[120px]">
              {slot4ZoneCleared ? (
                <button
                  onClick={handleUnlockSlot4}
                  className="font-pixel text-[6px] text-gold cursor-pointer hover:text-gold/80"
                >
                  🔓 4. Slot — €5 investieren
                </button>
              ) : (
                <span className="font-pixel text-[6px] text-rpg-muted">
                  🔒 {slot4Zone ? `${slot4Zone.emoji} ${slot4Zone.name}` : PARTY_SLOT_4_ZONE} + €5
                </span>
              )}
            </div>
          )}
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
        {resolvedMercs.map((merc) => {
          const zoneCleared = zoneProgress[merc.unlockZoneId]?.cleared ?? false
          const unlocked = zoneCleared
          const recruited = recruitedIds.includes(merc.id)
          const inParty = partySlots.includes(merc.id)
          const zone = getZoneById(merc.unlockZoneId)

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
                  <span className="font-pixel text-[6px] text-rpg-muted">
                    🔒 {zone ? `${zone.emoji} ${zone.name}` : merc.unlockZoneId}
                  </span>
                )}
                {unlocked && !recruited && (
                  <button
                    onClick={() => handleRecruit(merc.id, merc.recruitCost)}
                    disabled={combatTokens < merc.recruitCost && merc.recruitCost > 0}
                    className="font-pixel text-[7px] text-gold border border-gold/30 rounded px-2 py-1 cursor-pointer hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {merc.recruitCost > 0 ? `🪙 ${merc.recruitCost}` : 'Gratis!'}
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
