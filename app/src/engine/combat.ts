import type { Enemy } from '../types/game'
import type { ZoneDef, ZoneEnemy, EnemyTrait } from '../types/zone'
import type { ActiveSpellBuff, ActiveDoT } from '../types/spell'
import { getEncounterEnemy } from './zones'
import { isSpellReady, applySpellEffect } from './spells'

import { rollLootDrop, rollBossLoot } from './loot'
import { getPetBonusValue } from './pets'
import { getPetById } from '../data/pets'
import { getSpellById } from '../data/spells'

// ── Trait constants (single source of truth for trait mechanics) ──

/** Armored trait: damage reduction multiplier */
export const TRAIT_ARMORED_REDUCTION = 0.5
/** Swift trait: dodge probability */
export const TRAIT_SWIFT_DODGE_CHANCE = 0.3
/** Regenerating trait: % of maxHP healed per tick */
export const TRAIT_REGEN_PERCENT = 0.02
/** Shielded trait: number of hits absorbed */
export const TRAIT_SHIELD_HITS = 3
/** Enraged trait: HP threshold to trigger (30%) */
export const TRAIT_ENRAGE_THRESHOLD = 0.3
/** Enraged trait: bonus HP as fraction of maxHP */
export const TRAIT_ENRAGE_BONUS = 0.5
/** Cursed trait: crit chance reduction multiplier */
export const TRAIT_CURSED_CRIT_REDUCTION = 0.5

// ── Combat tick result ──

export interface TraitDamageResult {
  finalDamage: number
  shieldConsumed: boolean
  dodged: boolean
}

/**
 * Apply enemy trait modifiers to incoming damage.
 * Pure function — returns the modified damage and any trait state changes.
 */
export function applyTraitModifiers(
  baseDamage: number,
  traits: EnemyTrait[],
  shieldHitsRemaining: number,
): TraitDamageResult {
  let dmg = baseDamage

  // Armored: 50% damage reduction
  if (traits.includes('armored')) {
    dmg = Math.floor(dmg * TRAIT_ARMORED_REDUCTION)
  }

  // Swift: chance to dodge
  if (traits.includes('swift') && Math.random() < TRAIT_SWIFT_DODGE_CHANCE) {
    return { finalDamage: 0, shieldConsumed: false, dodged: true }
  }

  // Shielded: absorb hits
  if (shieldHitsRemaining > 0) {
    return { finalDamage: 0, shieldConsumed: true, dodged: false }
  }

  return { finalDamage: dmg, shieldConsumed: false, dodged: false }
}

/**
 * Calculate effective crit chance after trait modifiers.
 */
export function getEffectiveCritChance(baseCrit: number, traits: EnemyTrait[]): number {
  if (traits.includes('cursed')) return baseCrit * TRAIT_CURSED_CRIT_REDUCTION
  return baseCrit
}

/**
 * Calculate regeneration amount for an enemy with the regenerating trait.
 * Returns 0 if enemy doesn't have the trait.
 */
export function getRegenAmount(maxHp: number, traits: EnemyTrait[]): number {
  if (!traits.includes('regenerating')) return 0
  return Math.floor(maxHp * TRAIT_REGEN_PERCENT)
}

/**
 * Calculate enemy attack damage.
 * Derives from zone baseEnemyHP — tougher zones hit harder.
 * Defense reduces damage (flat reduction, min 1).
 */
export function getEnemyAttack(zone: ZoneDef, enemy: ZoneEnemy, playerDefense: number): number {
  // Enemy base attack: ~15% of zone baseHP, scaled by enemy's HP multiplier
  const rawAttack = Math.ceil(zone.baseEnemyHP * 0.15 * enemy.hpMultiplier)
  // Bosses hit 2x harder
  const bossMultiplier = enemy.isBoss ? 2 : 1
  const totalAttack = rawAttack * bossMultiplier
  // Defense reduces damage (cap reduction at 80% so fights are never trivial)
  const reduction = Math.min(playerDefense, Math.floor(totalAttack * 0.8))
  return Math.max(1, totalAttack - reduction)
}
