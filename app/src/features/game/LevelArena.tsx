import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useEquipmentStore, getGearBonuses } from '../../stores/equipmentStore'
import { useSpellStore } from '../../stores/spellStore'
import { usePetStore } from '../../stores/petStore'
import { useMercenaryStore } from '../../stores/mercenaryStore'
import { getDPS, getCritChance } from '../../engine/progression'
import { rollLootDrop, rollBossLoot } from '../../engine/loot'
import { getEncounterEnemy } from '../../engine/zones'
import { isSpellReady, applySpellEffect } from '../../engine/spells'
import { getPartyBonuses, rollMercDamage } from '../../engine/mercenaries'
import { getPetBonusValue } from '../../engine/pets'
import { RARITY_CONFIG } from '../../types/equipment'
import { TRAIT_ICONS } from '../../types/zone'
import { ZONES, getZoneById } from '../../data/zones'
import { getSpellById } from '../../data/spells'
import { getPetById } from '../../data/pets'
import { HealthBar } from '../../components/HealthBar'
import { SpellBar } from './SpellBar'

export function LevelArena() {
  const enemy = useGameStore((s) => s.enemy)
  const damageNumbers = useGameStore((s) => s.damageNumbers)
  const enemiesDefeated = useGameStore((s) => s.enemiesDefeated)
  const killStreak = useGameStore((s) => s.killStreak)
  const mana = useGameStore((s) => s.mana)
  const maxMana = useGameStore((s) => s.maxMana)
  const activeSpellBuffs = useGameStore((s) => s.activeSpellBuffs)

  const currentZoneId = useEquipmentStore((s) => s.currentZoneId)
  const encounter = useEquipmentStore((s) => s.encounter)
  const encounterSequence = useEquipmentStore((s) => s.encounterSequence)
  const equipped = useEquipmentStore((s) => s.equipped)
  const zoneProgress = useEquipmentStore((s) => s.zoneProgress)

  const char = useCharacterStore()
  const partySlots = useMercenaryStore((s) => s.partySlots)
  const equippedPetId = usePetStore((s) => s.equippedPetId)
  const petStates = usePetStore((s) => s.petStates)

  const [lastDrop, setLastDrop] = useState<{ name: string; rarity: string; emoji: string } | null>(null)
  const [bossIntro, setBossIntro] = useState(false)

  const zone = getZoneById(currentZoneId) ?? ZONES[0]

  const gear = getGearBonuses(equipped)
  const partyBonuses = getPartyBonuses(partySlots)

  // Pet bonus
  let petAttackBonus = 0
  let petCritBonus = 0
  let petGoldFindBonus = 0
  if (equippedPetId) {
    const pet = getPetById(equippedPetId)
    const petState = petStates[equippedPetId]
    if (pet && petState) {
      const val = getPetBonusValue(pet, petState)
      if (pet.passiveBonus.stat === 'attack' && pet.passiveBonus.isMultiplier) petAttackBonus = val
      if (pet.passiveBonus.stat === 'critChance') petCritBonus = val
      if (pet.passiveBonus.stat === 'goldFind') petGoldFindBonus = val
    }
  }

  // Spell buff bonuses
  let spellAttackBonus = 0
  let spellCritBonus = 0
  for (const buff of activeSpellBuffs) {
    if (buff.stat === 'attack') spellAttackBonus += buff.value
    if (buff.stat === 'critChance') spellCritBonus += buff.value
  }

  const baseDps = getDPS(char, gear.attack)
  const dps = Math.floor((baseDps + partyBonuses.flatDPSBonus) * (1 + partyBonuses.percentDPSBonus + petAttackBonus + spellAttackBonus))
  const critChance = Math.min(0.5, getCritChance(char, gear.critChance) + partyBonuses.critBoostBonus + petCritBonus + spellCritBonus)
  const totalGoldFind = gear.goldFind + partyBonuses.tokenBoostBonus + petGoldFindBonus

  // Stable ref for RAF callback
  const combatRef = useRef({ dps, critChance, goldFind: totalGoldFind, encounter, zone, encounterSequence, partySlots })
  combatRef.current = { dps, critChance, goldFind: totalGoldFind, encounter, zone, encounterSequence, partySlots }

  const lastTickRef = useRef(performance.now())
  const accumRef = useRef(0)
  const rafRef = useRef<number>(0)
  const shakeRef = useRef(false)
  const [, forceUpdate] = useForceUpdate()

  useEffect(() => {
    const attackInterval = 1000

    function tick() {
      const now = performance.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      accumRef.current += delta
      if (accumRef.current >= attackInterval) {
        accumRef.current -= attackInterval

        const {
          dps: curDps, critChance: curCrit, goldFind,
          encounter: curEncounter, zone: curZone, encounterSequence: curSeq,
          partySlots: curParty,
        } = combatRef.current

        const curEnemy = useGameStore.getState().enemy

        // --- Mana regen ---
        const manaExtra = getPartyBonuses(curParty).manaRegenBonus
        useGameStore.getState().regenMana(1 + manaExtra)

        // --- Auto-cast spells ---
        const spellState = useSpellStore.getState()
        if (spellState.autoCast) {
          for (const spellId of spellState.equippedSpellIds) {
            if (!isSpellReady(spellId, spellState.cooldowns)) continue
            const spell = getSpellById(spellId)
            if (!spell) continue
            if (!useGameStore.getState().spendMana(spell.manaCost)) continue

            useSpellStore.getState().setCooldown(spellId, spell.cooldownMs)
            const result = applySpellEffect(spell, curDps, curEnemy.hp, curEnemy.maxHp)

            if (result.damage > 0) {
              useGameStore.getState().dealDamage(result.damage, false, 0, 1)
              useGameStore.getState().addDamageNumber(result.damage, false, true)
            }
            if (result.executed) {
              useGameStore.getState().dealDamage(curEnemy.hp, false, 0, 1)
              useGameStore.getState().addDamageNumber(curEnemy.hp, false, true)
            }
            if (result.buff) useGameStore.getState().addSpellBuff(result.buff)
            if (result.dot) useGameStore.getState().addDoT(result.dot)
          }
        }

        // --- DoT ticks ---
        const dotDmg = useGameStore.getState().tickDoTs(curDps)
        if (dotDmg > 0) {
          useGameStore.getState().dealDamage(dotDmg, false, 0, 1)
          useGameStore.getState().addDamageNumber(dotDmg, false, true)
        }

        useGameStore.getState().cleanExpiredBuffs()

        // --- Trait: cursed ---
        let effectiveCrit = curCrit
        if (curEnemy.traits.includes('cursed')) effectiveCrit *= 0.5

        // --- Player attack ---
        const isCrit = Math.random() < effectiveCrit
        let dmg = isCrit ? Math.floor(curDps * 2) : curDps

        // Trait: armored
        if (curEnemy.traits.includes('armored')) dmg = Math.floor(dmg * 0.5)
        // Trait: swift (dodge)
        if (curEnemy.traits.includes('swift') && Math.random() < 0.3) dmg = 0
        // Trait: shielded
        if (curEnemy.shieldHitsRemaining > 0) {
          dmg = 0
          useGameStore.setState((s) => ({
            enemy: { ...s.enemy, shieldHitsRemaining: s.enemy.shieldHitsRemaining - 1 },
          }))
        }

        // --- Mercenary damage ---
        const mercDmg = rollMercDamage(curParty)
        const totalDmg = dmg + mercDmg

        if (totalDmg > 0) {
          const curEnemyDef = getEncounterEnemy(curZone, curSeq, curEncounter)
          const tokenMult = curZone.baseTokenReward * curEnemyDef.tokenMultiplier / 10

          const died = useGameStore.getState().dealDamage(totalDmg, isCrit, goldFind, tokenMult)
          useGameStore.getState().addDamageNumber(totalDmg, isCrit)
          shakeRef.current = true
          forceUpdate()

          setTimeout(() => { shakeRef.current = false; forceUpdate() }, 300)

          // Trait: regenerating
          if (!died && curEnemy.traits.includes('regenerating')) {
            const healAmt = Math.floor(curEnemy.maxHp * 0.02)
            useGameStore.setState((s) => ({
              enemy: { ...s.enemy, hp: Math.min(s.enemy.maxHp, s.enemy.hp + healAmt) },
            }))
          }

          if (died) {
            useGameStore.getState().incrementStreak()

            // Pet XP
            if (usePetStore.getState().equippedPetId) {
              usePetStore.getState().addPetXP(curEncounter)
            }

            // Loot
            const isBossEncounter = curEncounter === curSeq.length
            const currentPity = useEquipmentStore.getState().pityCounter

            if (isBossEncounter) {
              const bossLoot = rollBossLoot(curZone.bossLootTable, curZone.unlockMonth)
              if (bossLoot) {
                useEquipmentStore.getState().addToInventory(bossLoot.item)
                useEquipmentStore.getState().setPityCounter(bossLoot.newPity)
                setLastDrop({ name: bossLoot.item.name, rarity: bossLoot.item.rarity, emoji: bossLoot.item.emoji })
                setTimeout(() => setLastDrop(null), 2000)
              }
              useEquipmentStore.getState().markZoneCleared()
            } else {
              const drop = rollLootDrop(curEncounter + curZone.unlockMonth * 5, currentPity)
              if (drop) {
                useEquipmentStore.getState().addToInventory(drop.item)
                useEquipmentStore.getState().setPityCounter(drop.newPity)
                setLastDrop({ name: drop.item.name, rarity: drop.item.rarity, emoji: drop.item.emoji })
                setTimeout(() => setLastDrop(null), 2000)
              }
            }

            useEquipmentStore.getState().markZoneEncounterDefeated()

            const maxEnc = curSeq.length
            const nextEnc = curEncounter + 1

            if (nextEnc > maxEnc) {
              // Zone run complete — loop back
              useEquipmentStore.getState().selectZone(curZone.id)
              const newSeq = useEquipmentStore.getState().encounterSequence
              const nextEnemy = getEncounterEnemy(curZone, newSeq, 1)
              const charLvl = useCharacterStore.getState().level
              setTimeout(() => useGameStore.getState().spawnEnemy(curZone, nextEnemy, charLvl), 500)
            } else {
              useEquipmentStore.getState().advanceEncounter()
              const nextEnemy = getEncounterEnemy(curZone, curSeq, nextEnc)
              const charLvl = useCharacterStore.getState().level

              if (nextEnemy.isBoss) {
                setBossIntro(true)
                setTimeout(() => {
                  setBossIntro(false)
                  useGameStore.getState().spawnEnemy(curZone, nextEnemy, charLvl)
                }, 1500)
              } else {
                setTimeout(() => useGameStore.getState().spawnEnemy(curZone, nextEnemy, charLvl), 500)
              }
            }
          }
        } else {
          useGameStore.getState().addDamageNumber(0, false)
        }
      }

      useGameStore.getState().cleanDamageNumbers()
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [forceUpdate])

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3 relative overflow-hidden">
      {/* Zone + encounter header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{zone.emoji}</span>
          <span className="font-pixel text-[8px] text-gold">{zone.name}</span>
          <span className="font-pixel text-[7px] text-rpg-muted">— {encounter}/{encounterSequence.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {killStreak >= 5 && (
            <span className="font-pixel text-[7px] text-orange-400">🔥{killStreak}</span>
          )}
          <span className="font-pixel text-[7px] text-rpg-muted">×{enemiesDefeated}</span>
        </div>
      </div>

      {/* Boss intro overlay */}
      <AnimatePresence>
        {bossIntro && (
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-rpg-bg/95 rounded-lg border-2 border-red-500"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: 1 }}
                className="text-5xl mb-2"
              >
                {zone.enemies.find((e) => e.isBoss)?.emoji ?? '💀'}
              </motion.div>
              <div className="font-pixel text-[11px] text-red-400">BOSS KAMPF!</div>
              <div className="font-pixel text-[7px] text-rpg-muted mt-1">
                {zone.enemies.find((e) => e.isBoss)?.name}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combat area */}
      <div className="flex items-center justify-center gap-4 py-3">
        <div className="flex flex-col items-center">
          <div className="text-3xl animate-idle-bob">🧙</div>
          <span className="font-pixel text-[6px] text-rpg-muted mt-1">DPS {dps}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-rpg-border" />
          <span className="font-pixel text-[6px] text-rpg-muted">VS</span>
          <div className="w-px h-6 bg-rpg-border" />
        </div>

        <div className="flex flex-col items-center">
          <div className={`transition-transform ${enemy.isBoss ? 'text-5xl' : 'text-4xl'} ${shakeRef.current ? 'animate-shake' : ''}`}>
            {enemy.emoji}
          </div>
          <span className={`font-pixel text-[7px] mt-1 ${enemy.isBoss ? 'text-red-400' : 'text-rpg-accent'}`}>
            {enemy.name}
          </span>
          {enemy.traits.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {[...new Set(enemy.traits)].map((trait) => (
                <span key={trait} className="text-[10px]" title={trait}>{TRAIT_ICONS[trait]}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HP bar */}
      <div className="w-full max-w-[260px] mx-auto">
        <HealthBar
          current={enemy.hp}
          max={enemy.maxHp}
          color={enemy.isBoss ? 'bg-red-500' : 'bg-hp-red'}
          label="HP"
          height="h-2.5"
        />
      </div>

      {/* Mana bar */}
      <div className="w-full max-w-[260px] mx-auto mt-1">
        <div className="flex items-center gap-1">
          <span className="font-pixel text-[6px] text-blue-400">MP</span>
          <div className="flex-1 bg-rpg-bg rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${maxMana > 0 ? (mana / maxMana) * 100 : 0}%` }}
            />
          </div>
          <span className="font-pixel text-[6px] text-rpg-muted">{Math.floor(mana)}/{maxMana}</span>
        </div>
      </div>

      {/* Encounter progress dots */}
      <div className="flex justify-center gap-1 mt-2">
        {encounterSequence.map((_, idx) => {
          const enc = idx + 1
          const isBoss = idx === encounterSequence.length - 1
          const isDefeated = enc < encounter
          const isCurrent = enc === encounter
          return (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full border ${isBoss ? 'border-red-500' : 'border-rpg-border'} ${
                isDefeated ? (isBoss ? 'bg-red-500' : 'bg-gold') :
                isCurrent ? 'bg-rpg-accent animate-pulse' : 'bg-rpg-bg'
              }`}
            />
          )
        })}
      </div>

      {/* Spell Bar */}
      <SpellBar dps={dps} enemyHp={enemy.hp} enemyMaxHp={enemy.maxHp} />

      {/* Loot drop notification */}
      <AnimatePresence>
        {lastDrop && (
          <motion.div
            key="loot-drop"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg border font-pixel text-[7px] whitespace-nowrap backdrop-blur-sm"
            style={{
              borderColor: RARITY_CONFIG[lastDrop.rarity as keyof typeof RARITY_CONFIG]?.color,
              color: RARITY_CONFIG[lastDrop.rarity as keyof typeof RARITY_CONFIG]?.color,
              backgroundColor: `${RARITY_CONFIG[lastDrop.rarity as keyof typeof RARITY_CONFIG]?.color}20`,
            }}
          >
            {lastDrop.emoji} {lastDrop.name}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Damage numbers */}
      <AnimatePresence>
        {damageNumbers.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 1, y: 0, x: Math.random() * 60 - 30 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className={`absolute top-1/3 left-1/2 font-pixel pointer-events-none ${
              d.isSpell ? 'text-blue-400 text-sm' :
              d.isCrit ? 'text-gold text-sm' : 'text-white text-xs'
            }`}
          >
            {d.value === 0 ? 'MISS' : `${d.isCrit ? '💥' : d.isSpell ? '✨' : ''}-${d.value}`}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function useForceUpdate(): [number, () => void] {
  const [n, setN] = useState(0)
  return [n, () => setN((x) => x + 1)]
}
