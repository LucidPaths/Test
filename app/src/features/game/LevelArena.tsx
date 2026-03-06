import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useEquipmentStore, getGearBonuses } from '../../stores/equipmentStore'
import { useSpellStore } from '../../stores/spellStore'
import { usePetStore } from '../../stores/petStore'
import { useMercenaryStore } from '../../stores/mercenaryStore'
import { getDPS, getCritChance, getDefense } from '../../engine/progression'
import { rollLootDrop, rollBossLoot } from '../../engine/loot'
import { getEncounterEnemy } from '../../engine/zones'
import { isSpellReady, applySpellEffect } from '../../engine/spells'
import { getPartyBonuses, rollMercDamage } from '../../engine/mercenaries'
import { getPetBonusValue } from '../../engine/pets'
import { applyTraitModifiers, getEffectiveCritChance, getRegenAmount, getEnemyAttack } from '../../engine/combat'
import { RARITY_CONFIG, type Rarity } from '../../types/equipment'
import { TRAIT_ICONS } from '../../types/zone'
import { ATTACK_INTERVAL_MS, CHARACTER_INFO } from '../../constants/gameBalances'
import { useSavingsStore } from '../../stores/savingsStore'
import { ZONES, getZoneById } from '../../data/zones'
import { getSpellById } from '../../data/spells'
import { getPetById } from '../../data/pets'
import { getMercById } from '../../data/mercenaries'
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
  const playerHp = useGameStore((s) => s.playerHp)
  const playerMaxHp = useGameStore((s) => s.playerMaxHp)
  const playerDead = useGameStore((s) => s.playerDead)

  const currentZoneId = useEquipmentStore((s) => s.currentZoneId)
  const encounter = useEquipmentStore((s) => s.encounter)
  const encounterSequence = useEquipmentStore((s) => s.encounterSequence)
  const equipped = useEquipmentStore((s) => s.equipped)

  const char = useCharacterStore()
  const gender = useSavingsStore((s) => s.gender)
  const partySlots = useMercenaryStore((s) => s.partySlots)
  const mercLevels = useMercenaryStore((s) => s.mercLevels)
  const equippedPetId = usePetStore((s) => s.equippedPetId)
  const petStates = usePetStore((s) => s.petStates)

  const [lastDrop, setLastDrop] = useState<{ name: string; rarity: Rarity; emoji: string } | null>(null)
  const [bossIntro, setBossIntro] = useState(false)

  const zone = getZoneById(currentZoneId) ?? ZONES[0]
  const activeMercs = partySlots.filter((id): id is string => id !== null)

  const gear = getGearBonuses(equipped)
  const partyBonuses = getPartyBonuses(partySlots, mercLevels)
  const defense = getDefense(char) + gear.defense

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

  // Spell buff bonuses (defense buffs also reduce incoming damage)
  let spellAttackBonus = 0
  let spellCritBonus = 0
  let spellDefBonus = 0
  for (const buff of activeSpellBuffs) {
    if (buff.stat === 'attack') spellAttackBonus += buff.value
    if (buff.stat === 'critChance') spellCritBonus += buff.value
    if (buff.stat === 'defense') spellDefBonus += buff.value
  }

  const baseDps = getDPS(char, gear.attack)
  const dps = Math.floor((baseDps + partyBonuses.flatDPSBonus) * (1 + partyBonuses.percentDPSBonus + petAttackBonus + spellAttackBonus))
  const critChance = Math.min(0.5, getCritChance(char, gear.critChance) + partyBonuses.critBoostBonus + petCritBonus + spellCritBonus)
  const totalGoldFind = gear.goldFind + partyBonuses.tokenBoostBonus + petGoldFindBonus
  const totalDefense = defense + Math.floor(defense * spellDefBonus)

  // Sync player max HP from character level
  useEffect(() => {
    useGameStore.getState().syncPlayerHP(char.maxHp)
  }, [char.maxHp])

  // Stable ref for RAF callback
  const combatRef = useRef({ dps, critChance, goldFind: totalGoldFind, encounter, zone, encounterSequence, partySlots, mercLevels, defense: totalDefense })
  combatRef.current = { dps, critChance, goldFind: totalGoldFind, encounter, zone, encounterSequence, partySlots, mercLevels, defense: totalDefense }

  const lastTickRef = useRef(performance.now())
  const accumRef = useRef(0)
  const rafRef = useRef<number>(0)
  const shakeRef = useRef(false)
  const playerShakeRef = useRef(false)
  const [, forceUpdate] = useForceUpdate()

  useEffect(() => {
    const attackInterval = ATTACK_INTERVAL_MS

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
          partySlots: curParty, mercLevels: curMercLevels, defense: curDefense,
        } = combatRef.current

        const gameState = useGameStore.getState()
        const curEnemy = gameState.enemy

        // --- Skip combat if player is dead ---
        if (gameState.playerDead) {
          useGameStore.getState().cleanDamageNumbers()
          rafRef.current = requestAnimationFrame(tick)
          return
        }

        // --- Mana regen + HP regen ---
        const partyBonus = getPartyBonuses(curParty, curMercLevels)
        useGameStore.getState().regenMana(1 + partyBonus.manaRegenBonus)
        if (partyBonus.hpRegenBonus > 0) {
          const healAmt = Math.max(1, Math.floor(gameState.playerMaxHp * partyBonus.hpRegenBonus))
          useGameStore.getState().healPlayer(healAmt)
        }

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

        // --- Trait-modified crit + player attack ---
        const effectiveCrit = getEffectiveCritChance(curCrit, curEnemy.traits)
        const isCrit = Math.random() < effectiveCrit
        const rawDmg = isCrit ? Math.floor(curDps * 2) : curDps

        const traitResult = applyTraitModifiers(rawDmg, curEnemy.traits, curEnemy.shieldHitsRemaining)
        let dmg = traitResult.finalDamage
        if (traitResult.shieldConsumed) {
          useGameStore.getState().decrementShield()
        }

        // --- Mercenary damage ---
        const mercDmg = rollMercDamage(curParty, curMercLevels)
        const totalDmg = dmg + mercDmg

        // --- Enemy attacks player ---
        const curEnemyDef = getEncounterEnemy(curZone, curSeq, curEncounter)
        const enemyDmg = getEnemyAttack(curZone, curEnemyDef, curDefense)
        const playerDied = useGameStore.getState().damagePlayer(enemyDmg)

        if (playerDied) {
          playerShakeRef.current = true
          forceUpdate()
          setTimeout(() => { playerShakeRef.current = false; forceUpdate() }, 300)

          // Respawn after 2 seconds, reset zone run back to encounter 1
          setTimeout(() => {
            useGameStore.getState().respawnPlayer()
            useEquipmentStore.getState().selectZone(curZone.id)
            const newSeq = useEquipmentStore.getState().encounterSequence
            const charLvl = useCharacterStore.getState().level
            const firstEnemy = getEncounterEnemy(curZone, newSeq, 1)
            useGameStore.getState().spawnEnemy(curZone, firstEnemy, charLvl)
          }, 2000)
        }

        if (totalDmg > 0 && !playerDied) {
          const tokenMult = curZone.baseTokenReward * curEnemyDef.tokenMultiplier / 10

          const died = useGameStore.getState().dealDamage(totalDmg, isCrit, goldFind, tokenMult)
          useGameStore.getState().addDamageNumber(totalDmg, isCrit)
          shakeRef.current = true
          forceUpdate()

          setTimeout(() => { shakeRef.current = false; forceUpdate() }, 300)

          // Trait: regenerating
          if (!died) {
            const healAmt = getRegenAmount(curEnemy.maxHp, curEnemy.traits)
            if (healAmt > 0) useGameStore.getState().healEnemy(healAmt)
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

              // Unlock spell/pet/merc from this zone immediately
              if (curZone.spellUnlock) useSpellStore.getState().unlockSpell(curZone.spellUnlock)
              if (curZone.petUnlock) usePetStore.getState().unlockPet(curZone.petUnlock)
              // Merc unlocks are zone-based (Kaserne shows them when zone is accessible)
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
        } else if (totalDmg === 0 && !playerDied) {
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

      {/* Death overlay */}
      <AnimatePresence>
        {playerDead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-rpg-bg/90 rounded-lg border-2 border-rpg-accent"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">💀</div>
              <div className="font-pixel text-[10px] text-rpg-accent">BESIEGT!</div>
              <div className="font-pixel text-[6px] text-rpg-muted mt-1">Wiederbelebung...</div>
              <div className="font-pixel text-[5px] text-rpg-muted mt-0.5">-10% Tokens — Neustart ab Gegner 1</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combat area */}
      <div className="flex items-center justify-center gap-4 py-3">
        {/* Player + party side */}
        <div className="flex flex-col items-center gap-1">
          <div className={`text-3xl animate-idle-bob ${playerShakeRef.current ? 'animate-shake' : ''}`}>{CHARACTER_INFO[gender].emoji}</div>
          <span className="font-pixel text-[6px] text-rpg-muted">DPS {dps}</span>
          {/* Party members (mercs + pet) */}
          {(activeMercs.length > 0 || equippedPetId) && (
            <div className="flex gap-1 mt-0.5">
              {activeMercs.map((mercId) => {
                const merc = getMercById(mercId, gender)
                return merc ? (
                  <span key={mercId} className="text-base animate-idle-bob" title={merc.name} style={{ animationDelay: '0.2s' }}>
                    {merc.emoji}
                  </span>
                ) : null
              })}
              {equippedPetId && (() => {
                const pet = getPetById(equippedPetId)
                const petState = petStates[equippedPetId]
                if (!pet || !petState) return null
                const evo = [...pet.evolution].reverse().find(e => petState.level >= e.level)
                return (
                  <span key="pet" className="text-sm animate-idle-bob" title={pet.name} style={{ animationDelay: '0.4s' }}>
                    {evo?.emoji ?? pet.emoji}
                  </span>
                )
              })()}
            </div>
          )}
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

      {/* Player HP bar */}
      <div className="w-full max-w-[260px] mx-auto mb-1">
        <div className="flex items-center gap-1">
          <span className="font-pixel text-[6px] text-xp-green">HP</span>
          <div className="flex-1 bg-rpg-bg rounded-full h-1.5 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-300 ${playerHp / playerMaxHp < 0.3 ? 'bg-rpg-accent' : 'bg-xp-green'}`}
              style={{ width: `${playerMaxHp > 0 ? (playerHp / playerMaxHp) * 100 : 0}%` }}
            />
          </div>
          <span className="font-pixel text-[6px] text-rpg-muted">{playerHp}/{playerMaxHp}</span>
        </div>
      </div>

      {/* Enemy HP bar */}
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
              borderColor: RARITY_CONFIG[lastDrop.rarity]?.color,
              color: RARITY_CONFIG[lastDrop.rarity]?.color,
              backgroundColor: `${RARITY_CONFIG[lastDrop.rarity]?.color}20`,
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
