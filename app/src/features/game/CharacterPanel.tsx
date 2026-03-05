import { useCharacterStore } from '../../stores/characterStore'
import { useSavingsStore } from '../../stores/savingsStore'
import { useEquipmentStore, getGearBonuses } from '../../stores/equipmentStore'
import { getDPS, getCritChance, getDefense } from '../../engine/progression'
import { HealthBar } from '../../components/HealthBar'
import { StatBadge } from '../../components/StatBadge'

export function CharacterPanel() {
  const char = useCharacterStore()
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const equipped = useEquipmentStore((s) => s.equipped)
  const stage = useEquipmentStore((s) => s.stage)

  const gear = getGearBonuses(equipped)
  const dps = getDPS(char, gear.attack)
  const crit = getCritChance(char, gear.critChance)
  const def = getDefense(char)

  const simYears = Math.floor(simulatedMonths / 12)
  const simMonths = simulatedMonths % 12

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="text-3xl animate-idle-bob">🧙</div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rpg-bg border border-rpg-border rounded px-1">
            <span className="font-pixel text-[6px] text-gold">Lv.{char.level}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-pixel text-[9px] text-rpg-text">Sparritter</span>
            <span className="font-pixel text-[7px] text-rpg-muted">
              {simYears > 0 ? `${simYears}J ${simMonths}M` : `${simMonths}M`} | Stufe {stage}
            </span>
          </div>
          <HealthBar
            current={char.xpProgress * 100}
            max={100}
            color="bg-xp-green"
            label="XP"
            showNumbers={false}
            height="h-2"
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <StatBadge label="ATK" value={dps} icon="⚔️" />
        <StatBadge label="DEF" value={def} icon="🛡️" />
        <StatBadge label="KRIT" value={`${Math.round(crit * 100)}%`} icon="💥" />
      </div>

      {char.buffs.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {char.buffs.map((buff) => (
            <div
              key={buff.id}
              title={`${buff.name}: ${buff.description}`}
              className="text-sm bg-rpg-bg rounded px-1.5 py-0.5 cursor-help border border-rpg-border"
            >
              {buff.icon}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
