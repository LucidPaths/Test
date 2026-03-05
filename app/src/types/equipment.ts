export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type EquipSlot = 'weapon' | 'armor' | 'accessory' | 'rune'

export interface GearItem {
  id: string
  name: string
  emoji: string
  slot: EquipSlot
  rarity: Rarity
  // Stat bonuses when equipped
  attack: number
  defense: number
  critChance: number  // flat addition, e.g. 0.02 = +2%
  goldFind: number    // multiplier for token drops, e.g. 0.15 = +15%
}

export const RARITY_CONFIG: Record<Rarity, { color: string; label: string; multiplier: number }> = {
  common:    { color: '#9ca3af', label: 'Gewöhnlich', multiplier: 1 },
  uncommon:  { color: '#22c55e', label: 'Ungewöhnlich', multiplier: 2 },
  rare:      { color: '#3b82f6', label: 'Selten', multiplier: 4 },
  epic:      { color: '#a855f7', label: 'Episch', multiplier: 10 },
  legendary: { color: '#f59e0b', label: 'Legendär', multiplier: 25 },
}

export const SLOT_LABELS: Record<EquipSlot, { label: string; emoji: string }> = {
  weapon:    { label: 'Waffe', emoji: '⚔️' },
  armor:     { label: 'Rüstung', emoji: '🛡️' },
  accessory: { label: 'Accessoire', emoji: '💍' },
  rune:      { label: 'Rune', emoji: '🔮' },
}
