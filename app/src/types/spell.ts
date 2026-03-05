export type SpellEffect =
  | { type: 'damage'; multiplier: number }
  | { type: 'dot'; tickMultiplier: number; ticks: number }
  | { type: 'buff'; stat: 'attack' | 'critChance' | 'defense'; value: number; durationMs: number }
  | { type: 'execute'; hpThreshold: number }

export interface Spell {
  id: string
  name: string
  emoji: string
  description: string
  unlockZoneId: string          // Zone that must be cleared to unlock
  cooldownMs: number
  manaCost: number
  effect: SpellEffect
}

export interface ActiveSpellBuff {
  spellId: string
  stat: 'attack' | 'critChance' | 'defense'
  value: number
  expiresAt: number             // timestamp
}

export interface ActiveDoT {
  spellId: string
  tickMultiplier: number        // multiplier of DPS per tick
  ticksRemaining: number
}
