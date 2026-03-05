export interface Enemy {
  name: string
  emoji: string
  hp: number
  maxHp: number
  level: number
}

export interface DamageNumber {
  id: string
  value: number
  isCrit: boolean
  timestamp: number
}

