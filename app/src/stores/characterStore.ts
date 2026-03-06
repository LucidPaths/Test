import { create } from 'zustand'
import type { Buff } from '../types/character'
import type { FinancialProduct } from '../types/savings'
import { getLevelForBalance, getXPProgress } from '../engine/progression'
import { getActiveBuffs } from '../engine/buffs'

interface CharacterStore {
  name: string
  level: number
  xpProgress: number
  hp: number
  maxHp: number
  baseAttack: number
  baseDefense: number
  baseCritChance: number
  buffs: Buff[]
  recalculate: (balance: number, products: FinancialProduct[]) => void
}

export const useCharacterStore = create<CharacterStore>()((set) => ({
  name: 'Held',
  level: 1,
  xpProgress: 0,
  hp: 100,
  maxHp: 100,
  baseAttack: 5,
  baseDefense: 3,
  baseCritChance: 0.05,
  buffs: [],

  recalculate: (balance, products) => {
    const level = getLevelForBalance(balance)
    const xpProgress = getXPProgress(balance)
    const buffs = getActiveBuffs(balance, products)
    // Quadratic scaling: early levels feel similar, higher levels gain survivability
    // Lv1: 110, Lv10: 220, Lv50: 1100, Lv80: 2180, Lv100: 3100
    const maxHp = 100 + level * 10 + Math.floor(level * level * 0.2)

    set({
      level,
      xpProgress,
      buffs,
      maxHp,
      hp: maxHp,
      baseAttack: 5 + Math.floor(level * 1.5),
      baseDefense: 3 + level,
      baseCritChance: 0.05 + level * 0.002,
    })
  },
}))
