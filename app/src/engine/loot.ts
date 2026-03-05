import type { GearItem, Rarity, EquipSlot } from '../types/equipment'

// Drop rate table — cumulative thresholds (must sum to 1.0)
const DROP_RATES: { rarity: Rarity; weight: number }[] = [
  { rarity: 'common', weight: 0.60 },
  { rarity: 'uncommon', weight: 0.25 },
  { rarity: 'rare', weight: 0.10 },
  { rarity: 'epic', weight: 0.04 },
  { rarity: 'legendary', weight: 0.01 },
]

// Pity: guaranteed rare+ after this many common/uncommon drops in a row
export const PITY_THRESHOLD = 15

// Item name pools per slot — German financial theme
const ITEM_NAMES: Record<EquipSlot, { name: string; emoji: string }[]> = {
  weapon: [
    { name: 'Budget-Klinge', emoji: '🗡️' },
    { name: 'Spar-Schwert', emoji: '⚔️' },
    { name: 'Rendite-Rapier', emoji: '🔪' },
    { name: 'Zinseszins-Axt', emoji: '🪓' },
    { name: 'Dividenden-Dolch', emoji: '🗡️' },
  ],
  armor: [
    { name: 'Notgroschen-Schild', emoji: '🛡️' },
    { name: 'Diversifikations-Platte', emoji: '🪖' },
    { name: 'Sparplan-Rüstung', emoji: '🛡️' },
    { name: 'ETF-Kettenhemd', emoji: '⛓️' },
    { name: 'Risikostreuungs-Harnisch', emoji: '🛡️' },
  ],
  accessory: [
    { name: 'Zins-Ring', emoji: '💍' },
    { name: 'Rendite-Amulett', emoji: '📿' },
    { name: 'Freistellungs-Kette', emoji: '📿' },
    { name: 'Inflationsschutz-Armband', emoji: '⌚' },
    { name: 'Vermögensaufbau-Brosche', emoji: '💎' },
  ],
  rune: [
    { name: 'Rune des Sparens', emoji: '🔮' },
    { name: 'Rune der Geduld', emoji: '🔮' },
    { name: 'Rune des Zinseszins', emoji: '✨' },
    { name: 'Rune der Disziplin', emoji: '💠' },
    { name: 'Rune der Weisheit', emoji: '🔮' },
  ],
}

function rollRarity(pityCounter: number): Rarity {
  // Pity system: force rare+ after threshold
  if (pityCounter >= PITY_THRESHOLD) {
    const roll = Math.random()
    if (roll < 0.05) return 'legendary'
    if (roll < 0.25) return 'epic'
    return 'rare'
  }

  const roll = Math.random()
  let cumulative = 0
  for (const { rarity, weight } of DROP_RATES) {
    cumulative += weight
    if (roll < cumulative) return rarity
  }
  return 'common'
}

function rollSlot(): EquipSlot {
  const slots: EquipSlot[] = ['weapon', 'armor', 'accessory', 'rune']
  return slots[Math.floor(Math.random() * slots.length)]
}

function rollStats(rarity: Rarity, enemyLevel: number): Pick<GearItem, 'attack' | 'defense' | 'critChance' | 'goldFind'> {
  const rarityScale = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16 }
  const scale = rarityScale[rarity]
  const base = 1 + Math.floor(enemyLevel / 5)

  // Randomize which stats get bonuses
  return {
    attack: Math.random() < 0.6 ? Math.floor(base * scale * (0.8 + Math.random() * 0.4)) : 0,
    defense: Math.random() < 0.4 ? Math.floor(base * scale * (0.5 + Math.random() * 0.3)) : 0,
    critChance: Math.random() < 0.3 ? Math.round(scale * 0.005 * (0.8 + Math.random() * 0.4) * 1000) / 1000 : 0,
    goldFind: Math.random() < 0.35 ? Math.round(scale * 0.03 * (0.8 + Math.random() * 0.4) * 100) / 100 : 0,
  }
}

/**
 * Roll a loot drop from a defeated enemy.
 * Returns null if no drop (enemies don't always drop gear).
 * Drop chance: 15% base, +2% per enemy level, capped at 40%.
 */
export function rollLootDrop(enemyLevel: number, pityCounter: number): { item: GearItem; newPity: number } | null {
  const dropChance = Math.min(0.40, 0.15 + enemyLevel * 0.02)
  if (Math.random() > dropChance) return null

  const rarity = rollRarity(pityCounter)
  const slot = rollSlot()
  const pool = ITEM_NAMES[slot]
  const template = pool[Math.floor(Math.random() * pool.length)]
  const stats = rollStats(rarity, enemyLevel)

  const newPity = (rarity === 'common' || rarity === 'uncommon') ? pityCounter + 1 : 0

  return {
    item: {
      id: `gear-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: template.name,
      emoji: template.emoji,
      slot,
      rarity,
      ...stats,
    },
    newPity,
  }
}

/**
 * Roll boss loot — guaranteed drop from the boss loot table.
 * Boss loot is always rare+ and uses the boss-specific item definitions.
 */
export function rollBossLoot(
  bossLootTable: import('../types/zone').BossLootEntry[],
  zoneIndex: number,
): { item: GearItem; newPity: number } | null {
  if (bossLootTable.length === 0) return null

  const entry = bossLootTable[Math.floor(Math.random() * bossLootTable.length)]
  const rarity = entry.guaranteedRarity
  const scale = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16 }[rarity]
  const base = 2 + zoneIndex * 2

  // Stats based on profile
  const stats = {
    attack: 0,
    defense: 0,
    critChance: 0,
    goldFind: 0,
  }

  switch (entry.statProfile) {
    case 'attack':
      stats.attack = Math.floor(base * scale * 1.2)
      stats.critChance = Math.round(scale * 0.005 * 1000) / 1000
      break
    case 'defense':
      stats.defense = Math.floor(base * scale * 1.1)
      stats.attack = Math.floor(base * scale * 0.3)
      break
    case 'crit':
      stats.critChance = Math.round(scale * 0.008 * 1000) / 1000
      stats.attack = Math.floor(base * scale * 0.5)
      break
    case 'goldFind':
      stats.goldFind = Math.round(scale * 0.05 * 100) / 100
      stats.attack = Math.floor(base * scale * 0.4)
      break
    case 'balanced':
      stats.attack = Math.floor(base * scale * 0.7)
      stats.defense = Math.floor(base * scale * 0.5)
      stats.critChance = Math.round(scale * 0.003 * 1000) / 1000
      stats.goldFind = Math.round(scale * 0.02 * 100) / 100
      break
  }

  return {
    item: {
      id: `boss-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: entry.itemNameOverride,
      emoji: entry.emoji,
      slot: entry.slot,
      rarity,
      ...stats,
    },
    newPity: 0, // Boss loot resets pity
  }
}
