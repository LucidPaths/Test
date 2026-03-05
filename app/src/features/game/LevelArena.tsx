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

      const died = dealDamage(dmg, isCrit, gear.goldFind)
      addDamageNumber(dmg, isCrit)
      shakeRef.current = true
      forceUpdate()

      setTimeout(() => {
        shakeRef.current = false
        forceUpdate()
      }, 300)

      if (died) {
        const currentPity = useEquipmentStore.getState().pityCounter
        const drop = rollLootDrop(stage, currentPity)
        if (drop) {
          addToInventory(drop.item)
          setPityCounter(drop.newPity)
          setLastDrop({ name: drop.item.name, rarity: drop.item.rarity, emoji: drop.item.emoji })
          setTimeout(() => setLastDrop(null), 2000)
        }

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

  // Zone name based on stage tier
  const zoneName = getZoneName(stage)

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3 relative overflow-hidden">
      {/* Zone + stage header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[8px] text-gold">{zoneName}</span>
          <span className="font-pixel text-[7px] text-rpg-muted">— Stufe {stage}</span>
        </div>
        <span className="font-pixel text-[7px] text-rpg-muted">
          ×{enemiesDefeated}
        </span>
      </div>

      {/* Combat area */}
      <div className="flex items-center justify-center gap-4 py-3">
        {/* Character */}
        <div className="flex flex-col items-center">
          <div className="text-3xl animate-idle-bob">🧙</div>
          <span className="font-pixel text-[6px] text-rpg-muted mt-1">DPS {dps}</span>
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-rpg-border" />
          <span className="font-pixel text-[6px] text-rpg-muted">VS</span>
          <div className="w-px h-6 bg-rpg-border" />
        </div>

        {/* Enemy */}
        <div className="flex flex-col items-center">
          <div
            className={`text-4xl transition-transform ${
              shakeRef.current ? 'animate-shake' : ''
            }`}
          >
            {enemy.emoji}
          </div>
          <span className="font-pixel text-[7px] text-rpg-accent mt-1">{enemy.name}</span>
        </div>
      </div>

      {/* HP bar */}
      <div className="w-full max-w-[260px] mx-auto">
        <HealthBar
          current={enemy.hp}
          max={enemy.maxHp}
          color="bg-hp-red"
          label="HP"
          height="h-2.5"
        />
      </div>

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
              d.isCrit ? 'text-gold text-sm' : 'text-white text-xs'
            }`}
          >
            {d.isCrit ? '💥' : ''}-{d.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function getZoneName(stage: number): string {
  const zones = [
    'Schulden-Sumpf',       // 1-9
    'Gebühren-Grotte',      // 10-19
    'Zins-Ödland',          // 20-29
    'Inflations-Höhle',     // 30-39
    'Steuer-Festung',       // 40-49
    'Kredit-Labyrinth',     // 50-59
    'Börsen-Vulkan',        // 60-69
    'Rezessions-Turm',      // 70-79
    'Deflations-Gipfel',    // 80-89
    'Schulden-Thron',       // 90+
  ]
  const tier = Math.min(Math.floor((stage - 1) / 10), zones.length - 1)
  return zones[tier]
}

function useForceUpdate(): [number, () => void] {
  const [n, setN] = useState(0)
  return [n, () => setN((x) => x + 1)]
}
