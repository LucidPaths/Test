import { motion } from 'framer-motion'
import { ZONES } from '../../data/zones'
import { useEquipmentStore } from '../../stores/equipmentStore'
import { useSavingsStore } from '../../stores/savingsStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useGameStore } from '../../stores/gameStore'
import { isZoneUnlocked, getEncounterEnemy, generateEncounterSequence } from '../../engine/zones'

export function ZoneMap() {
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const currentZoneId = useEquipmentStore((s) => s.currentZoneId)
  const zoneProgress = useEquipmentStore((s) => s.zoneProgress)
  const selectZone = useEquipmentStore((s) => s.selectZone)

  const handleSelectZone = (zoneId: string) => {
    if (!isZoneUnlocked(zoneId, simulatedMonths)) return
    selectZone(zoneId)
    // Spawn first enemy of the new zone
    const zone = ZONES.find((z) => z.id === zoneId)
    if (!zone) return
    const seq = useEquipmentStore.getState().encounterSequence
    const enemy = getEncounterEnemy(zone, seq, 1)
    const charLvl = useCharacterStore.getState().level
    useGameStore.getState().spawnEnemy(zone, enemy, charLvl)
  }

  const unlockedCount = ZONES.filter((z) => isZoneUnlocked(z.id, simulatedMonths)).length
  const clearedCount = ZONES.filter((z) => zoneProgress[z.id]?.cleared).length

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Header */}
      <div className="text-center py-2">
        <div className="text-3xl mb-1">🗺️</div>
        <h2 className="font-pixel text-[11px] text-gold">Weltkarte</h2>
        <p className="font-pixel text-[7px] text-rpg-muted mt-1">
          {clearedCount}/{ZONES.length} Zonen abgeschlossen • {unlockedCount} freigeschaltet
        </p>
      </div>

      {/* Zone list */}
      <div className="flex flex-col gap-2">
        {ZONES.map((zone, i) => {
          const unlocked = isZoneUnlocked(zone.id, simulatedMonths)
          const progress = zoneProgress[zone.id]
          const isCurrent = currentZoneId === zone.id
          const cleared = progress?.cleared ?? false
          const timesCleared = progress?.timesCleared ?? 0
          const encountersDefeated = progress?.encountersDefeated ?? 0

          // Star rating: 1 star = 1 clear, 2 stars = 3 clears, 3 stars = 10 clears
          const stars = timesCleared >= 10 ? 3 : timesCleared >= 3 ? 2 : timesCleared >= 1 ? 1 : 0

          return (
            <motion.button
              key={zone.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelectZone(zone.id)}
              disabled={!unlocked}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                isCurrent
                  ? 'bg-gold/10 border-gold/50'
                  : unlocked
                  ? 'bg-rpg-panel border-rpg-border cursor-pointer hover:border-gold/30'
                  : 'bg-rpg-panel/30 border-rpg-border/30 cursor-not-allowed opacity-50'
              }`}
            >
              {/* Zone emoji */}
              <span className={`text-2xl ${!unlocked ? 'grayscale' : ''}`}>
                {unlocked ? zone.emoji : '🔒'}
              </span>

              {/* Zone info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-pixel text-[8px] ${isCurrent ? 'text-gold' : 'text-rpg-text'}`}>
                    {zone.name}
                  </span>
                  {/* Stars */}
                  {stars > 0 && (
                    <span className="font-pixel text-[8px] text-gold">
                      {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                    </span>
                  )}
                </div>
                <p className="font-pixel text-[6px] text-rpg-muted truncate">{zone.description}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                {!unlocked && (
                  <span className="font-pixel text-[7px] text-rpg-muted">Monat {zone.unlockMonth}</span>
                )}
                {unlocked && !cleared && encountersDefeated > 0 && (
                  <span className="font-pixel text-[7px] text-rpg-accent">{encountersDefeated}/10</span>
                )}
                {cleared && (
                  <span className="font-pixel text-[7px] text-green-400">✅</span>
                )}
                {isCurrent && (
                  <span className="font-pixel text-[6px] text-gold">⚔️ AKTIV</span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
