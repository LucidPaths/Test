import { useCharacterStore } from '../../stores/characterStore'
import { getDPS, getCritChance, getDefense } from '../../engine/progression'
import { HealthBar } from '../../components/HealthBar'
import { StatBadge } from '../../components/StatBadge'

export function CharacterPanel() {
  const char = useCharacterStore()

  const dps = getDPS(char)
  const crit = getCritChance(char)
  const def = getDefense(char)

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl animate-idle-bob">🧙</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[10px] text-gold">Lv.{char.level}</span>
            <span className="font-pixel text-[9px] text-rpg-muted">{char.name}</span>
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
        <StatBadge label="CRIT" value={`${Math.round(crit * 100)}%`} icon="💥" />
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
