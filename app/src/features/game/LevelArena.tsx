import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useEquipmentStore, getGearBonuses } from '../../stores/equipmentStore'
import { getDPS, getCritChance } from '../../engine/progression'
import { rollLootDrop } from '../../engine/loot'
import { RARITY_CONFIG } from '../../types/equipment'
import { HealthBar } from '../../components/HealthBar'

export function LevelArena() {
  const enemy = useGameStore((s) => s.enemy)
  const damageNumbers = useGameStore((s) => s.damageNumbers)
  const enemiesDefeated = useGameStore((s) => s.enemiesDefeated)
  const combatTokens = useGameStore((s) => s.combatTokens)
  const dealDamage = useGameStore((s) => s.dealDamage)
  const spawnEnemy = useGameStore((s) => s.spawnEnemy)
  const addDamageNumber = useGameStore((s) => s.addDamageNumber)
  const cleanDamageNumbers = useGameStore((s) => s.cleanDamageNumbers)

  const char = useCharacterStore()
  const stage = useEquipmentStore((s) => s.stage)
  const equipped = useEquipmentStore((s) => s.equipped)
  const pityCounter = useEquipmentStore((s) => s.pityCounter)
  const advanceStage = useEquipmentStore((s) => s.advanceStage)
  const addToInventory = useEquipmentStore((s) => s.addToInventory)
  const setPityCounter = useEquipmentStore((s) => s.setPityCounter)

  const [lastDrop, setLastDrop] = useState<{ name: string; rarity: string; emoji: string } | null>(null)

  const gear = getGearBonuses(equipped)
  const dps = getDPS(char, gear.attack)
  const critChance = getCritChance(char, gear.critChance)
  const attackInterval = 1000

  const lastTickRef = useRef(performance.now())
  const accumRef = useRef(0)
  const rafRef = useRef<number>(0)
  const shakeRef = useRef(false)
  const [, forceUpdate] = useForceUpdate()

  const tick = useCallback(() => {
    const now = performance.now()
    const delta = now - lastTickRef.current
    lastTickRef.current = now

    accumRef.current += delta
    if (accumRef.current >= attackInterval) {
      accumRef.current -= attackInterval

      const isCrit = Math.random() < critChance
      const dmg = isCrit ? Math.floor(dps * 2) : dps

      const died = dealDamage(dmg, isCrit)
      addDamageNumber(dmg, isCrit)
      shakeRef.current = true
      forceUpdate()

      setTimeout(() => {
        shakeRef.current = false
        forceUpdate()
      }, 300)

      if (died) {
        // Try loot drop
        const currentPity = useEquipmentStore.getState().pityCounter
        const drop = rollLootDrop(stage, currentPity)
        if (drop) {
          addToInventory(drop.item)
          setPityCounter(drop.newPity)
          setLastDrop({ name: drop.item.name, rarity: drop.item.rarity, emoji: drop.item.emoji })
          setTimeout(() => setLastDrop(null), 2000)
        }

        // Advance stage, spawn next enemy at new stage
        advanceStage()
        const nextStage = useEquipmentStore.getState().stage
        setTimeout(() => spawnEnemy(nextStage), 500)
      }
    }

    cleanDamageNumbers()
    rafRef.current = requestAnimationFrame(tick)
  }, [dps, critChance, stage, dealDamage, spawnEnemy, addDamageNumber, cleanDamageNumbers, forceUpdate, advanceStage, addToInventory, setPityCounter])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3 relative overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="font-pixel text-[9px] text-rpg-muted">
          Stufe {stage}
        </span>
        <span className="font-pixel text-[8px] text-rpg-muted">
          Besiegt: {enemiesDefeated} | 🪙 {combatTokens}
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-pixel text-[10px] text-rpg-accent">{enemy.name}</span>

        <div className="flex items-center gap-6">
          <div className="text-3xl animate-idle-bob">🧙</div>
          <div className="font-pixel text-[8px] text-rpg-muted">VS</div>
          <div
            className={`text-4xl transition-transform ${
              shakeRef.current ? 'animate-shake' : ''
            }`}
          >
            {enemy.emoji}
          </div>
        </div>

        <div className="w-full max-w-[220px]">
          <HealthBar
            current={enemy.hp}
            max={enemy.maxHp}
            color="bg-hp-red"
            label="HP"
            height="h-3"
          />
        </div>

        <div className="font-pixel text-[8px] text-rpg-muted">
          DPS: {dps}
        </div>
      </div>

      {/* Loot drop notification */}
      <AnimatePresence>
        {lastDrop && (
          <motion.div
            key="loot-drop"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg border font-pixel text-[8px] whitespace-nowrap"
            style={{
              borderColor: RARITY_CONFIG[lastDrop.rarity as keyof typeof RARITY_CONFIG]?.color,
              color: RARITY_CONFIG[lastDrop.rarity as keyof typeof RARITY_CONFIG]?.color,
              backgroundColor: `${RARITY_CONFIG[lastDrop.rarity as keyof typeof RARITY_CONFIG]?.color}15`,
            }}
          >
            {lastDrop.emoji} {lastDrop.name} gefunden!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Damage numbers */}
      <AnimatePresence>
        {damageNumbers.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 1, y: 0, x: Math.random() * 60 - 30 }}
            animate={{ opacity: 0, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute top-1/3 left-1/2 font-pixel text-sm pointer-events-none ${
              d.isCrit ? 'text-gold text-base' : 'text-white'
            }`}
          >
            {d.isCrit ? '💥' : ''}-{d.value}
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
