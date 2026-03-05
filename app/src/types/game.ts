import type { EnemyTrait } from './zone'
import type { ActiveSpellBuff, ActiveDoT } from './spell'

export interface Enemy {
  name: string
  emoji: string
  hp: number
  maxHp: number
  level: number
  isBoss: boolean
  traits: EnemyTrait[]
  // Mutable trait combat state
  shieldHitsRemaining: number
  enrageTriggered: boolean
}

export interface DamageNumber {
  id: string
  value: number
  isCrit: boolean
  timestamp: number
  isSpell?: boolean
}

// Re-export for convenience
export type { ActiveSpellBuff, ActiveDoT }

