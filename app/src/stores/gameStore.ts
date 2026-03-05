import { create } from 'zustand'
import type { Enemy, DamageNumber } from '../types/game'
import { getEnemyHP, getEnemyName } from '../engine/progression'

interface GameStore {
  enemy: Enemy
  damageNumbers: DamageNumber[]
  isIdle: boolean
  lastTick: number
  enemiesDefeated: number
  spawnEnemy: (level: number) => void
  dealDamage: (amount: number, isCrit: boolean) => boolean // returns true if enemy died
  addDamageNumber: (value: number, isCrit: boolean) => void
  cleanDamageNumbers: () => void
  setLastTick: (t: number) => void
  resetCombat: () => void
}

export const useGameStore = create<GameStore>()((set, get) => ({
  enemy: { name: 'Schulden-Slime', emoji: '🟢', hp: 20, maxHp: 20, level: 1 },
  damageNumbers: [],
  isIdle: true,
  lastTick: Date.now(),
  enemiesDefeated: 0,

  spawnEnemy: (level) => {
    const { name, emoji } = getEnemyName(level)
    const hp = getEnemyHP(level)
    set({
      enemy: { name, emoji, hp, maxHp: hp, level },
    })
  },

  dealDamage: (amount, isCrit) => {
    const state = get()
    const newHp = Math.max(0, state.enemy.hp - amount)
    const died = newHp <= 0

    set({
      enemy: { ...state.enemy, hp: newHp },
      enemiesDefeated: died ? state.enemiesDefeated + 1 : state.enemiesDefeated,
    })

    return died
  },

  addDamageNumber: (value, isCrit) => {
    set((state) => ({
      damageNumbers: [
        ...state.damageNumbers,
        {
          id: `dmg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          value,
          isCrit,
          timestamp: Date.now(),
        },
      ].slice(-10), // keep last 10
    }))
  },

  cleanDamageNumbers: () => {
    const now = Date.now()
    set((state) => ({
      damageNumbers: state.damageNumbers.filter((d) => now - d.timestamp < 1000),
    }))
  },

  setLastTick: (t) => set({ lastTick: t }),

  resetCombat: () => set({
    enemy: { name: 'Schulden-Slime', emoji: '🟢', hp: 20, maxHp: 20, level: 1 },
    damageNumbers: [],
    enemiesDefeated: 0,
    lastTick: Date.now(),
  }),
}))
