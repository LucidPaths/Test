import { useGameStore } from '../../stores/gameStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useSavingsStore } from '../../stores/savingsStore'
import { useEquipmentStore } from '../../stores/equipmentStore'
import { usePetStore } from '../../stores/petStore'
import { useMercenaryStore } from '../../stores/mercenaryStore'
import { ZONES } from '../../data/zones'
import { PETS } from '../../data/pets'
import { MERCENARIES } from '../../data/mercenaries'

interface RankEntry {
  label: string
  value: string | number
  icon: string
}

export function RanglisteView() {
  const level = useCharacterStore((s) => s.level)
  const balance = useSavingsStore((s) => s.balance)
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const enemiesDefeated = useGameStore((s) => s.enemiesDefeated)
  const bestStreak = useGameStore((s) => s.bestStreak)
  const combatTokens = useGameStore((s) => s.combatTokens)
  const zoneProgress = useEquipmentStore((s) => s.zoneProgress)
  const stage = useEquipmentStore((s) => s.stage)
  const unlockedPetIds = usePetStore((s) => s.unlockedPetIds)
  const recruitedIds = useMercenaryStore((s) => s.recruitedIds)

  const zonesCleared = ZONES.filter((z) => zoneProgress[z.id]?.cleared).length
  const totalStars = ZONES.reduce((sum, z) => sum + (zoneProgress[z.id]?.timesCleared ?? 0), 0)

  // Rank title based on level
  const rank = getRankTitle(level)

  const stats: RankEntry[] = [
    { label: 'Level', value: level, icon: '⭐' },
    { label: 'Rang', value: rank, icon: '🏅' },
    { label: 'Prestige-Stufe', value: stage, icon: '🔄' },
    { label: 'Gespart', value: `€${balance.toFixed(2)}`, icon: '💰' },
    { label: 'Monate simuliert', value: simulatedMonths, icon: '📅' },
    { label: 'Gegner besiegt', value: enemiesDefeated, icon: '💀' },
    { label: 'Beste Serie', value: bestStreak, icon: '🔥' },
    { label: 'Tokens verdient', value: combatTokens, icon: '🪙' },
    { label: 'Zonen abgeschlossen', value: `${zonesCleared}/${ZONES.length}`, icon: '🗺️' },
    { label: 'Zone-Runs gesamt', value: totalStars, icon: '⭐' },
    { label: 'Begleiter', value: `${unlockedPetIds.length}/${PETS.length}`, icon: '🐾' },
    { label: 'Söldner', value: `${recruitedIds.length}/${MERCENARIES.length}`, icon: '⚔️' },
  ]

  // Milestones
  const milestones = [
    { name: 'Erste Einzahlung', done: balance > 0, icon: '🌱' },
    { name: 'Level 10', done: level >= 10, icon: '🎯' },
    { name: 'Level 25', done: level >= 25, icon: '🎯' },
    { name: 'Level 50', done: level >= 50, icon: '🎯' },
    { name: '100 Gegner', done: enemiesDefeated >= 100, icon: '⚔️' },
    { name: '1.000 Gegner', done: enemiesDefeated >= 1000, icon: '⚔️' },
    { name: '10er Serie', done: bestStreak >= 10, icon: '🔥' },
    { name: '25er Serie', done: bestStreak >= 25, icon: '🔥' },
    { name: 'Erste Zone geschafft', done: zonesCleared >= 1, icon: '🗺️' },
    { name: 'Alle Zonen geschafft', done: zonesCleared >= ZONES.length, icon: '🗺️' },
    { name: 'Erster Begleiter', done: unlockedPetIds.length >= 1, icon: '🐾' },
    { name: 'Alle Begleiter', done: unlockedPetIds.length >= PETS.length, icon: '🐾' },
    { name: '€1.000 gespart', done: balance >= 1000, icon: '💰' },
    { name: '€10.000 gespart', done: balance >= 10000, icon: '💰' },
    { name: '€100.000 gespart', done: balance >= 100000, icon: '🏆' },
  ]

  const completedCount = milestones.filter((m) => m.done).length

  return (
    <div className="flex flex-col gap-3 p-3">
      <div>
        <h2 className="font-pixel text-[11px] text-gold mb-1">🏆 Rangliste</h2>
        <p className="text-[10px] text-rpg-muted">
          Deine persönlichen Rekorde und Erfolge.
        </p>
      </div>

      {/* Rank card */}
      <div className="bg-rpg-panel border border-gold/30 rounded-lg p-3 text-center">
        <div className="text-3xl mb-1">{getRankEmoji(level)}</div>
        <div className="font-pixel text-[10px] text-gold">{rank}</div>
        <div className="font-pixel text-[7px] text-rpg-muted mt-0.5">Level {level} Sparmeister</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-rpg-panel border border-rpg-border rounded-lg px-2 py-1.5 flex items-center gap-1.5">
            <span className="text-sm">{stat.icon}</span>
            <div>
              <div className="font-pixel text-[6px] text-rpg-muted">{stat.label}</div>
              <div className="font-pixel text-[8px] text-rpg-text">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-pixel text-[9px] text-rpg-text">Erfolge</span>
          <span className="font-pixel text-[7px] text-rpg-muted">{completedCount}/{milestones.length}</span>
        </div>
        <div className="flex flex-col gap-1">
          {milestones.map((m) => (
            <div
              key={m.name}
              className={`flex items-center gap-2 px-2 py-1 rounded border ${
                m.done ? 'bg-rpg-panel border-gold/30' : 'bg-rpg-panel/30 border-rpg-border/30 opacity-50'
              }`}
            >
              <span className="text-sm">{m.done ? '✅' : '🔒'}</span>
              <span className="font-pixel text-[7px] text-rpg-text flex-1">{m.name}</span>
              <span className="text-sm">{m.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getRankTitle(level: number): string {
  if (level >= 90) return 'Spar-Legende'
  if (level >= 75) return 'Finanz-Meister'
  if (level >= 60) return 'Anlage-Experte'
  if (level >= 45) return 'Vermögens-Ritter'
  if (level >= 30) return 'Spar-Krieger'
  if (level >= 15) return 'Budget-Held'
  if (level >= 5) return 'Spar-Lehrling'
  return 'Anfänger'
}

function getRankEmoji(level: number): string {
  if (level >= 90) return '👑'
  if (level >= 75) return '🏆'
  if (level >= 60) return '🥇'
  if (level >= 45) return '🥈'
  if (level >= 30) return '🥉'
  if (level >= 15) return '🎖️'
  if (level >= 5) return '📜'
  return '🌱'
}
