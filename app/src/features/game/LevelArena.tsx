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
  const monthlyContribution = useSavingsStore((s) => s.monthlyContribution)
  const simulateTick = useSavingsStore((s) => s.simulateTick)
  const products = useSavingsStore((s) => s.products)
  const balance = useSavingsStore((s) => s.balance)
  const recalculate = useCharacterStore((s) => s.recalculate)

  const lastTickRef = useRef(performance.now())
  const accumRef = useRef(0)
  const simAccumRef = useRef(0)
  const rafRef = useRef<number>(0)
  const shakeRef = useRef(false)
  const [, forceUpdate] = useForceUpdate()

  const dps = getDPS(char, monthlyContribution)
  const critChance = getCritChance(char)
  const attackInterval = 1000 // 1 attack per second
  const simInterval = 3000 // 1 simulated month every 3 seconds (demo speed)

  const tick = useCallback(() => {
    const now = performance.now()
    const delta = now - lastTickRef.current
    lastTickRef.current = now

    // Combat tick
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
        setTimeout(() => spawnEnemy(char.level), 500)
      }
    }

    // Savings simulation tick — auto-grows balance from monthly plan
    simAccumRef.current += delta
    if (simAccumRef.current >= simInterval) {
      simAccumRef.current -= simInterval
      simulateTick()
      // Recalculate character with updated balance
      const newBalance = useSavingsStore.getState().balance
      recalculate(newBalance, products)
    }

    cleanDamageNumbers()
    rafRef.current = requestAnimationFrame(tick)
  }, [dps, critChance, char.level, dealDamage, spawnEnemy, addDamageNumber, cleanDamageNumbers, forceUpdate, simulateTick, recalculate, products])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

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

        <div className="flex items-center gap-6">
          {/* Character */}
          <div className="text-3xl animate-idle-bob">🧙</div>

          {/* VS */}
          <div className="font-pixel text-[8px] text-rpg-muted">VS</div>

          {/* Enemy */}
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
          DPS: {dps} (€{monthlyContribution}/Monat)
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
    </div>
  )
}

function useForceUpdate(): [number, () => void] {
  const [n, setN] = useState(0)
  return [n, () => setN((x) => x + 1)]
}
