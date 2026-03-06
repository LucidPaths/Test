export interface MercAbility {
  name: string
  emoji: string
  description: string
  type: 'flatDPS' | 'percentDPS' | 'critBoost' | 'tokenBoost' | 'manaRegen' | 'hpRegen'
  value: number
}

export interface Mercenary {
  id: string
  name: string
  emoji: string
  description: string
  unlockZoneId: string
  recruitCost: number
  baseDPS: number
  critChance: number
  specialAbility: MercAbility
  financialLesson: string
}
