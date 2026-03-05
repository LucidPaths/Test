import { useState, useEffect, useRef } from 'react'
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
  const stage = useEquipmentStore((s) => s.stage)
  const equipped = useEquipmentStore((s) => s.equipped)
  const char = useCharacterStore()

  const [lastDrop, setLastDrop] = useState<{ name: string; rarity: string; emoji: string } | null>(null)

  const gear = getGearBonuses(equipped)
  const dps = getDPS(char, gear.attack)
  const critChance = getCritChance(char, gear.critChance)

  // Store combat values in refs so the RAF callback stays stable
  const combatRef = useRef({ dps, critChance, goldFind: gear.goldFind, stage })
  combatRef.current = { dps, critChance, goldFind: gear.goldFind, stage }

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

        const { dps: curDps, critChance: curCrit, goldFind, stage: curStage } = combatRef.current
        const isCrit = Math.random() < curCrit
        const dmg = isCrit ? Math.floor(curDps * 2) : curDps

        const died = useGameStore.getState().dealDamage(dmg, isCrit, goldFind)
        useGameStore.getState().addDamageNumber(dmg, isCrit)
        shakeRef.current = true
        forceUpdate()

        setTimeout(() => {
          shakeRef.current = false
          forceUpdate()
        }, 300)

        if (died) {
          const currentPity = useEquipmentStore.getState().pityCounter
          const drop = rollLootDrop(curStage, currentPity)
          if (drop) {
            useEquipmentStore.getState().addToInventory(drop.item)
            useEquipmentStore.getState().setPityCounter(drop.newPity)
            setLastDrop({ name: drop.item.name, rarity: drop.item.rarity, emoji: drop.item.emoji })
            setTimeout(() => setLastDrop(null), 2000)
          }

          useEquipmentStore.getState().advanceStage()
          const nextStage = useEquipmentStore.getState().stage
          setTimeout(() => useGameStore.getState().spawnEnemy(nextStage), 500)
        }
      }

      useGameStore.getState().cleanDamageNumbers()
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [forceUpdate]) // stable — forceUpdate never changes identity

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
    'Schulden-Sumpf',
    'Gebühren-Grotte',
    'Zins-Ödland',
    'Inflations-Höhle',
    'Steuer-Festung',
    'Kredit-Labyrinth',
    'Börsen-Vulkan',
    'Rezessions-Turm',
    'Deflations-Gipfel',
    'Schulden-Thron',
  ]
  const tier = Math.min(Math.floor((stage - 1) / 10), zones.length - 1)
  return zones[tier]
}

function useForceUpdate(): [number, () => void] {
  const [n, setN] = useState(0)
  return [n, () => setN((x) => x + 1)]
}
