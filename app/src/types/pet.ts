export interface PetBonus {
  stat: 'attack' | 'defense' | 'critChance' | 'goldFind' | 'manaRegen' | 'allStats'
  value: number
  isMultiplier: boolean         // false = flat add, true = % multiplier
}

export interface PetEvolution {
  level: number
  name: string
  emoji: string
  bonusMultiplier: number       // Multiplies the base passive bonus
}

export interface Pet {
  id: string
  name: string
  emoji: string
  description: string
  unlockZoneId: string
  passiveBonus: PetBonus
  evolution: PetEvolution[]
}

export interface PetState {
  level: number
  xp: number
}
