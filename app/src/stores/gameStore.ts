import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Enemy, DamageNumber, ActiveSpellBuff, ActiveDoT } from '../types/game'
import type { ZoneEnemy, ZoneDef } from '../types/zone'
import { getZoneEnemyHP } from '../engine/zones'
import { TRAIT_SHIELD_HITS } from '../engine/combat'
import { INITIAL_MANA, INITIAL_MAX_MANA } from '../constants/gameBalances'

interface GameStore {
  enemy: Enemy
  damageNumbers: DamageNumber[]
  isIdle: boolean
  lastTick: number
  enemiesDefeated: number
  combatTokens: number

  // ── Zone combat state ──
  killStreak: number
  bestStreak: number
  mana: number
  maxMana: number
  activeSpellBuffs: ActiveSpellBuff[]
  activeDots: ActiveDoT[]

  // Actions
  spawnEnemy: (zone: ZoneDef, zoneEnemy: ZoneEnemy, characterLevel: number) => void
  dealDamage: (amount: number, isCrit: boolean, goldFindBonus?: number, tokenMultiplier?: number) => boolean
  spendTokens: (cost: number) => boolean
  addDamageNumber: (value: number, isCrit: boolean, isSpell?: boolean) => void
  cleanDamageNumbers: () => void
  setLastTick: (t: number) => void
  incrementStreak: () => void
  resetStreak: () => void
  regenMana: (amount?: number) => void
  spendMana: (cost: number) => boolean
  setMaxMana: (max: number) => void
  addSpellBuff: (buff: ActiveSpellBuff) => void
  addDoT: (dot: ActiveDoT) => void
  tickDoTs: (dps: number) => number  // returns total DoT damage this tick
  cleanExpiredBuffs: () => void
  decrementShield: () => void
  healEnemy: (amount: number) => void
  resetCombat: () => void
}

const DEFAULT_ENEMY: Enemy = {
  name: 'Schulden-Slime', emoji: '🟢', hp: 25, maxHp: 25, level: 1,
  isBoss: false, traits: [], shieldHitsRemaining: 0, enrageTriggered: false,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      enemy: { ...DEFAULT_ENEMY },
      damageNumbers: [],
      isIdle: true,
      lastTick: Date.now(),
      enemiesDefeated: 0,
      combatTokens: 0,
      killStreak: 0,
      bestStreak: 0,
      mana: INITIAL_MANA,
      maxMana: INITIAL_MAX_MANA,
      activeSpellBuffs: [],
      activeDots: [],

      spawnEnemy: (zone, zoneEnemy, characterLevel) => {
        const hp = getZoneEnemyHP(zone, zoneEnemy, characterLevel)
        set({
          enemy: {
            name: zoneEnemy.name,
            emoji: zoneEnemy.emoji,
            hp,
            maxHp: hp,
            level: zone.unlockMonth * 10 + 1,
            isBoss: zoneEnemy.isBoss,
            traits: [...zoneEnemy.traits],
            shieldHitsRemaining: zoneEnemy.traits.includes('shielded') ? TRAIT_SHIELD_HITS : 0,
            enrageTriggered: false,
          },
        })
      },

      dealDamage: (amount, isCrit, goldFindBonus = 0, tokenMultiplier = 1) => {
        const state = get()
        const newHp = Math.max(0, state.enemy.hp - amount)
        const died = newHp <= 0

        const baseTokens = died ? Math.floor(10 * tokenMultiplier) : 0
        const tokenDrop = died ? Math.floor(baseTokens * (1 + goldFindBonus)) : 0

        // Check enrage trigger
        let enemy = { ...state.enemy, hp: newHp }
        if (
          !enemy.enrageTriggered &&
          enemy.traits.includes('enraged') &&
          newHp > 0 &&
          newHp <= enemy.maxHp * 0.3
        ) {
          const bonusHp = Math.floor(enemy.maxHp * 0.5)
          enemy = {
            ...enemy,
            hp: newHp + bonusHp,
            maxHp: enemy.maxHp + bonusHp,
            enrageTriggered: true,
          }
        }

        set({
          enemy,
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

      addDamageNumber: (value, isCrit, isSpell = false) => {
        set((state) => ({
          damageNumbers: [
            ...state.damageNumbers,
            {
              id: `dmg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              value,
              isCrit,
              isSpell,
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

      incrementStreak: () =>
        set((s) => {
          const next = s.killStreak + 1
          return { killStreak: next, bestStreak: Math.max(s.bestStreak, next) }
        }),

      resetStreak: () => set({ killStreak: 0 }),

      regenMana: (amount = 1) =>
        set((s) => ({ mana: Math.min(s.maxMana, s.mana + amount) })),

      spendMana: (cost) => {
        const state = get()
        if (state.mana < cost) return false
        set({ mana: state.mana - cost })
        return true
      },

      setMaxMana: (max) => set({ maxMana: max, mana: Math.min(get().mana, max) }),

      addSpellBuff: (buff) =>
        set((s) => ({
          activeSpellBuffs: [...s.activeSpellBuffs.filter((b) => b.spellId !== buff.spellId), buff],
        })),

      addDoT: (dot) =>
        set((s) => ({
          activeDots: [...s.activeDots.filter((d) => d.spellId !== dot.spellId), dot],
        })),

      tickDoTs: (dps) => {
        const state = get()
        let totalDamage = 0
        const remaining: ActiveDoT[] = []

        for (const dot of state.activeDots) {
          const dmg = Math.floor(dps * dot.tickMultiplier)
          totalDamage += dmg
          if (dot.ticksRemaining > 1) {
            remaining.push({ ...dot, ticksRemaining: dot.ticksRemaining - 1 })
          }
        }

        set({ activeDots: remaining })
        return totalDamage
      },

      cleanExpiredBuffs: () => {
        const now = Date.now()
        set((s) => ({
          activeSpellBuffs: s.activeSpellBuffs.filter((b) => b.expiresAt > now),
        }))
      },

      decrementShield: () =>
        set((s) => ({
          enemy: {
            ...s.enemy,
            shieldHitsRemaining: Math.max(0, s.enemy.shieldHitsRemaining - 1),
          },
        })),

      healEnemy: (amount) =>
        set((s) => ({
          enemy: {
            ...s.enemy,
            hp: Math.min(s.enemy.maxHp, s.enemy.hp + amount),
          },
        })),

      resetCombat: () => set({
        enemy: { ...DEFAULT_ENEMY },
        damageNumbers: [],
        enemiesDefeated: 0,
        combatTokens: 0,
        killStreak: 0,
        bestStreak: 0,
        mana: INITIAL_MANA,
        maxMana: INITIAL_MAX_MANA,
        activeSpellBuffs: [],
        activeDots: [],
        lastTick: Date.now(),
      }),
    }),
    {
      name: '100k-game-v2',
      partialize: (state) => ({
        enemiesDefeated: state.enemiesDefeated,
        combatTokens: state.combatTokens,
        bestStreak: state.bestStreak,
      }),
    }
  )
)
