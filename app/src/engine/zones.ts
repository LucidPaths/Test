import type { ZoneDef, ZoneEnemy } from '../types/zone'
import { ZONES } from '../data/zones'

/**
 * Generate an encounter sequence for a zone run.
 * Returns 10 enemy IDs: 9 shuffled regulars (no immediate repeats) + boss at position 10.
 */
export function generateEncounterSequence(zone: ZoneDef): string[] {
  const regulars = zone.enemies.filter((e) => !e.isBoss)
  const boss = zone.enemies.find((e) => e.isBoss)
  if (!boss) throw new Error(`Zone ${zone.id} has no boss enemy`)

  // Fill 9 slots from the regular pool using a shuffle bag approach
  const sequence: string[] = []
  let bag: string[] = []

  for (let i = 0; i < 9; i++) {
    // Refill bag when empty
    if (bag.length === 0) {
      bag = regulars.map((e) => e.id)
      // Fisher-Yates shuffle
      for (let j = bag.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1))
        ;[bag[j], bag[k]] = [bag[k], bag[j]]
      }
      // Avoid immediate repeat: if first of new bag == last of sequence, swap
      if (sequence.length > 0 && bag[0] === sequence[sequence.length - 1] && bag.length > 1) {
        ;[bag[0], bag[1]] = [bag[1], bag[0]]
      }
    }
    sequence.push(bag.shift()!)
  }

  // Boss is always encounter 10 (index 9)
  sequence.push(boss.id)
  return sequence
}

/**
 * Get the enemy definition for a given encounter in a zone.
 * encounter is 1-indexed (1-10).
 */
export function getEncounterEnemy(zone: ZoneDef, encounterSequence: string[], encounter: number): ZoneEnemy {
  const idx = Math.max(0, Math.min(encounter - 1, encounterSequence.length - 1))
  const enemyId = encounterSequence[idx]
  return zone.enemies.find((e) => e.id === enemyId) ?? zone.enemies[0]
}

/**
 * Calculate enemy HP for a zone encounter.
 * Scales with zone base HP, enemy multiplier, and character level for gentle scaling.
 */
export function getZoneEnemyHP(zone: ZoneDef, enemy: ZoneEnemy, characterLevel: number): number {
  const levelScale = 1 + characterLevel * 0.03
  return Math.floor(zone.baseEnemyHP * enemy.hpMultiplier * levelScale)
}

/**
 * Calculate token reward for killing an enemy in a zone.
 */
export function getZoneTokenReward(zone: ZoneDef, enemy: ZoneEnemy, goldFindBonus: number): number {
  const base = zone.baseTokenReward * enemy.tokenMultiplier
  return Math.floor(base * (1 + goldFindBonus))
}

/**
 * Check if a zone is unlocked based on simulated months.
 */
export function isZoneUnlocked(zoneId: string, simulatedMonths: number): boolean {
  const zone = ZONES.find((z) => z.id === zoneId)
  if (!zone) return false
  return simulatedMonths >= zone.unlockMonth
}

/**
 * Get the number of unlocked zones.
 */
export function getUnlockedZoneCount(simulatedMonths: number): number {
  return ZONES.filter((z) => simulatedMonths >= z.unlockMonth).length
}
