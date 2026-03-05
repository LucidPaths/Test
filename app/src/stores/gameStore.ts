import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Enemy, DamageNumber } from '../types/game'
import { getEnemyHP, getEnemyName } from '../engine/progression'

interface GameStore {
  enemy: Enemy
  damageNumbers: DamageNumber[]
  isIdle: boolean
  lastTick: number
  enemiesDefeated: number
  combatTokens: number
  spawnEnemy: (stage: number) => void
  dealDamage: (amount: number, isCrit: boolean, goldFindBonus?: number) => boolean
  spendTokens: (cost: number) => boolean // returns false if can't afford
  addDamageNumber: (value: number, isCrit: boolean) => void
  cleanDamageNumbers: () => void
  setLastTick: (t: number) => void
  resetCombat: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      enemy: { name: 'Schulden-Slime', emoji: '🟢', hp: 20, maxHp: 20, level: 1 },
      damageNumbers: [],
      isIdle: true,
      lastTick: Date.now(),
      enemiesDefeated: 0,
      combatTokens: 0,

      spawnEnemy: (stage) => {
        const { name, emoji } = getEnemyName(stage)
        const hp = getEnemyHP(stage)
        set({
          enemy: { name, emoji, hp, maxHp: hp, level: stage },
        })
      },

      dealDamage: (amount, isCrit, goldFindBonus = 0) => {
        const state = get()
        const newHp = Math.max(0, state.enemy.hp - amount)
        const died = newHp <= 0

        // Tokens scale with enemy level, boosted by goldFind gear stat
        const baseTokens = died ? state.enemy.level * 2 + 5 : 0
        const tokenDrop = died ? Math.floor(baseTokens * (1 + goldFindBonus)) : 0

        set({
          enemy: { ...state.enemy, hp: newHp },
          enemiesDefeated: died ? state.enemiesDefeated + 1 : state.enemiesDefeated,
          combatTokens: state.combatTokens + tokenDrop,
        })

        return died
      },

      spendTokens: (cost) => {
        const state = get()
        if (state.combatTokens < cost) return false
        set({ combatTokens: state.combatTokens - cost })
        return true
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
          ].slice(-10),
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
        combatTokens: 0,
        lastTick: Date.now(),
      }),
    }),
    {
      name: '100k-game-v1',
      partialize: (state) => ({
        enemiesDefeated: state.enemiesDefeated,
        combatTokens: state.combatTokens,
      }),
    }
  )
)
