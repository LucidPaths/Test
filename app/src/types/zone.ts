import type { EquipSlot, Rarity } from './equipment'

export type EnemyTrait =
  | 'armored'      // Takes 50% less damage
  | 'swift'        // 30% dodge chance
  | 'enraged'      // +50% HP at 30% threshold (once)
  | 'regenerating' // Heals 2% maxHP per tick
  | 'wealthy'      // 3x token drops
  | 'cursed'       // Halves player crit chance
  | 'shielded'     // First 3 hits deal 0 damage

export const TRAIT_ICONS: Record<EnemyTrait, string> = {
  armored: '🛡️',
  swift: '💨',
  enraged: '😡',
  regenerating: '💚',
  wealthy: '💰',
  cursed: '🌑',
  shielded: '🔰',
}

export interface ZoneEnemy {
  id: string
  name: string
  emoji: string
  hpMultiplier: number      // Multiplied by zone base HP
  tokenMultiplier: number   // Multiplied by base token reward
  traits: EnemyTrait[]
  isBoss: boolean
}

export interface BossLootEntry {
  itemNameOverride: string
  emoji: string
  slot: EquipSlot
  guaranteedRarity: Rarity
  statProfile: 'attack' | 'defense' | 'balanced' | 'crit' | 'goldFind'
}

export interface ZoneDef {
  id: string                    // 'zone-0' through 'zone-11'
  name: string                  // German financial theme
  emoji: string
  description: string
  unlockMonth: number           // simulatedMonths required
  baseEnemyHP: number
  baseTokenReward: number
  enemies: ZoneEnemy[]          // indices 0..N-2 are regular, last is boss
  bossLootTable: BossLootEntry[]
  spellUnlock?: string
  petUnlock?: string
  mercenaryUnlock?: string
  completionReward: { tokens: number; buffId?: string }
}

export interface ZoneProgress {
  cleared: boolean              // All encounters beaten (boss killed)
  encountersDefeated: number    // 0-10 current run progress
  bestRun: number               // Highest encounter reached
  timesCleared: number          // Total full clears
  bossDefeated: boolean         // Boss killed at least once
}
