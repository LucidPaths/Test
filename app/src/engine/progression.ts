import type { Character } from '../types/character'

// Level thresholds: exponential mapping across 5 tiers
// Lvl 1-10: €0–100, Lvl 11-25: €100–1K, Lvl 26-50: €1K–10K
// Lvl 51-80: €10K–50K, Lvl 81-100: €50K–100K
function buildLevelThresholds(): number[] {
  const thresholds: number[] = [0]

  // Tier 1: levels 1-10, €0-100
  for (let i = 1; i <= 10; i++) thresholds.push(i * 10)
  // Tier 2: levels 11-25, €100-1000
  for (let i = 1; i <= 15; i++) thresholds.push(100 + i * 60)
  // Tier 3: levels 26-50, €1000-10000
  for (let i = 1; i <= 25; i++) thresholds.push(1000 + i * 360)
  // Tier 4: levels 51-80, €10000-50000
  for (let i = 1; i <= 30; i++) thresholds.push(10000 + i * 1333)
  // Tier 5: levels 81-100, €50000-100000
  for (let i = 1; i <= 20; i++) thresholds.push(50000 + i * 2500)

  return thresholds
}

const LEVEL_THRESHOLDS = buildLevelThresholds()

export function getLevelForBalance(balance: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (balance >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return Math.min(level, 100)
}

export function getXPProgress(balance: number): number {
  const level = getLevelForBalance(balance)
  if (level >= 100) return 1

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? 100000
  const range = nextThreshold - currentThreshold
  if (range <= 0) return 1

  return Math.min(1, (balance - currentThreshold) / range)
}

export function getEnemyHP(stage: number): number {
  return Math.floor(20 * Math.pow(1.12, stage))
}

export function getEnemyName(stage: number): { name: string; emoji: string } {
  const enemies = [
    { name: 'Schulden-Slime', emoji: '🟢' },
    { name: 'Kontogebühr-Kobold', emoji: '👺' },
    { name: 'Zins-Zombie', emoji: '🧟' },
    { name: 'Inflation-Imp', emoji: '😈' },
    { name: 'Steuer-Skelett', emoji: '💀' },
    { name: 'Kredit-Kraken', emoji: '🐙' },
    { name: 'Börsen-Basilisk', emoji: '🐉' },
    { name: 'Rezessions-Ritter', emoji: '🗡️' },
    { name: 'Deflations-Drache', emoji: '🔥' },
    { name: 'Schulden-Souverän', emoji: '👑' },
  ]
  const tier = Math.min(Math.floor(stage / 10), enemies.length - 1)
  return enemies[tier]
}

/**
 * DPS derives from character level + buffs + equipped gear.
 * Level only changes when monthly vesting hits (real money).
 * Gear comes from combat loot drops.
 */
export function getDPS(character: Character, gearAttack: number = 0): number {
  const baseDPS = character.baseAttack + gearAttack

  let multiplier = 1
  for (const buff of character.buffs) {
    if (buff.stat === 'attack') multiplier += buff.value
    if (buff.stat === 'allStats') multiplier += buff.value
  }

  return Math.max(1, Math.floor(baseDPS * multiplier))
}

export function getCritChance(character: Character, gearCrit: number = 0): number {
  let crit = character.baseCritChance + gearCrit
  for (const buff of character.buffs) {
    if (buff.stat === 'critChance') crit += buff.value
    if (buff.stat === 'allStats') crit += buff.value * 0.1
  }
  return Math.min(0.5, crit) // cap at 50%
}

export function getDefense(character: Character): number {
  let defense = character.baseDefense
  let multiplier = 1
  for (const buff of character.buffs) {
    if (buff.stat === 'defense') multiplier += buff.value
    if (buff.stat === 'allStats') multiplier += buff.value
  }
  return Math.floor(defense * multiplier)
}
