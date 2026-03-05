export interface Buff {
  id: string
  name: string
  icon: string
  description: string
  stat: 'attack' | 'defense' | 'critChance' | 'xpMultiplier' | 'allStats'
  value: number
  source: 'milestone' | 'product'
}

export interface Character {
  name: string
  level: number
  xpProgress: number // 0-1 within current level
  hp: number
  maxHp: number
  baseAttack: number
  baseDefense: number
  baseCritChance: number
  buffs: Buff[]
}
