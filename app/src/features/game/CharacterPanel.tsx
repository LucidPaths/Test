import { useCharacterStore } from '../../stores/characterStore'
import { useSavingsStore } from '../../stores/savingsStore'
import { useEquipmentStore, getGearBonuses } from '../../stores/equipmentStore'
import { usePetStore } from '../../stores/petStore'
import { useMercenaryStore } from '../../stores/mercenaryStore'
import { getDPS, getCritChance, getDefense } from '../../engine/progression'
import { getPartyBonuses, getTotalPartyDPS, getScaledMercDPS } from '../../engine/mercenaries'
import { getPetById } from '../../data/pets'
import { getMercById } from '../../data/mercenaries'
import { getPetBonusValue, getPetDisplayName, getPetDisplayEmoji } from '../../engine/pets'
import { CHARACTER_INFO } from '../../constants/gameBalances'
import { HealthBar } from '../../components/HealthBar'
import { StatBadge } from '../../components/StatBadge'

export function CharacterPanel() {
  const char = useCharacterStore()
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const gender = useSavingsStore((s) => s.gender)
  const equipped = useEquipmentStore((s) => s.equipped)
  const stage = useEquipmentStore((s) => s.stage)
  const equippedPetId = usePetStore((s) => s.equippedPetId)
  const petStates = usePetStore((s) => s.petStates)
  const partySlots = useMercenaryStore((s) => s.partySlots)
  const mercLevels = useMercenaryStore((s) => s.mercLevels)

  const gear = getGearBonuses(equipped)
  const dps = getDPS(char, gear.attack)
  const crit = getCritChance(char, gear.critChance)
  const def = getDefense(char)
  const partyBonuses = getPartyBonuses(partySlots, mercLevels)
  const totalDPS = getTotalPartyDPS(dps, partyBonuses)

  const equippedPet = equippedPetId ? getPetById(equippedPetId) : null
  const equippedPetState = equippedPetId ? petStates[equippedPetId] : null

  const charInfo = CHARACTER_INFO[gender]
  const simYears = Math.floor(simulatedMonths / 12)
  const simMonths = simulatedMonths % 12

  const activeMercs = partySlots.filter((id): id is string => id !== null)

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="text-3xl animate-idle-bob">{charInfo.emoji}</div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rpg-bg border border-rpg-border rounded px-1">
            <span className="font-pixel text-[6px] text-gold">Lv.{char.level}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-pixel text-[9px] text-rpg-text">{charInfo.name}</span>
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
        {partyBonuses.totalMercDPS > 0 && (
          <StatBadge label="PARTY" value={totalDPS} icon="👥" />
        )}
      </div>

      {/* Pet info */}
      {equippedPet && equippedPetState && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-rpg-border/30">
          <span className="text-lg">{getPetDisplayEmoji(equippedPet, equippedPetState)}</span>
          <span className="font-pixel text-[6px] text-rpg-muted">
            {getPetDisplayName(equippedPet, equippedPetState)} Lv.{equippedPetState.level}
          </span>
          <span className="font-pixel text-[6px] text-green-400">
            +{equippedPet.passiveBonus.isMultiplier
              ? `${Math.round(getPetBonusValue(equippedPet, equippedPetState) * 100)}%`
              : getPetBonusValue(equippedPet, equippedPetState)} {equippedPet.passiveBonus.stat}
          </span>
        </div>
      )}

      {/* Gruppe (Party) — mercenaries under player character */}
      {activeMercs.length > 0 && (
        <div className="mt-2 pt-2 border-t border-rpg-border/30">
          <span className="font-pixel text-[7px] text-rpg-muted">Gruppe</span>
          <div className="flex flex-col gap-1 mt-1">
            {activeMercs.map((mercId) => {
              const merc = getMercById(mercId, gender)
              if (!merc) return null
              const lvl = mercLevels[mercId] ?? 1
              return (
                <div key={mercId} className="flex items-center gap-2 bg-rpg-bg/50 rounded-lg px-2 py-1.5 border border-rpg-border/30">
                  <span className="text-xl">{merc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-pixel text-[7px] text-rpg-text">{merc.name} <span className="text-rpg-muted">Lv.{lvl}</span></div>
                    <div className="font-pixel text-[5px] text-rpg-muted">{merc.specialAbility.emoji} {merc.specialAbility.description}</div>
                  </div>
                  <span className="font-pixel text-[6px] text-green-400">DPS {getScaledMercDPS(merc, lvl)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
