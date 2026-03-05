import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { useCharacterStore } from '../../stores/characterStore'
import { useSavingsStore } from '../../stores/savingsStore'
import { getDPS, getCritChance } from '../../engine/progression'
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
  const balance = useSavingsStore((s) => s.balance)

  const lastTickRef = useRef(performance.now())
  const accumRef = useRef(0)
  const rafRef = useRef<number>(0)
  const shakeRef = useRef(false)
  const [, forceUpdate] = useReducerCompat()

  const dps = getDPS(char)
  const critChance = getCritChance(char)
  const tickInterval = 1000 // 1 attack per second

  const tick = useCallback(() => {
    const now = performance.now()
    const delta = now - lastTickRef.current
    lastTickRef.current = now
    accumRef.current += delta

    if (accumRef.current >= tickInterval) {
      accumRef.current -= tickInterval

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
        setTimeout(() => spawnEnemy(char.level), 500)
      }
    }

    cleanDamageNumbers()
    rafRef.current = requestAnimationFrame(tick)
  }, [dps, critChance, char.level, dealDamage, spawnEnemy, addDamageNumber, cleanDamageNumbers, forceUpdate])

  useEffect(() => {
    // Only fight if balance > 0 (you need to save to fight)
    if (balance <= 0) return

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick, balance])

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3 relative overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="font-pixel text-[9px] text-rpg-muted">
          Level {enemy.level}
        </span>
        <span className="font-pixel text-[8px] text-rpg-muted">
          Besiegt: {enemiesDefeated}
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-pixel text-[10px] text-rpg-accent">{enemy.name}</span>

        <div
          className={`text-5xl transition-transform ${
            shakeRef.current ? 'animate-shake' : ''
          }`}
        >
          {enemy.emoji}
        </div>

        <div className="w-full max-w-[200px]">
          <HealthBar
            current={enemy.hp}
            max={enemy.maxHp}
            color="bg-hp-red"
            label="HP"
            height="h-3"
          />
        </div>
      </div>

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

      {balance <= 0 && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="font-pixel text-[10px] text-rpg-muted text-center px-4">
            Spare Geld um zu kämpfen!
          </span>
        </div>
      )}
    </div>
  )
}

// Minimal forceUpdate hook
function useReducerCompat(): [number, () => void] {
  const [n, setN] = useState(0)
  return [n, () => setN((x) => x + 1)]
}

