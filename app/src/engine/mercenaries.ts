import type { Mercenary } from '../types/mercenary'
import { MERCENARIES, getMercById } from '../data/mercenaries'
import { MERC_DPS_PER_LEVEL, MERC_ABILITY_PER_LEVEL } from '../constants/gameBalances'

export interface PartyBonuses {
  totalMercDPS: number
  flatDPSBonus: number
  percentDPSBonus: number
  critBoostBonus: number
  tokenBoostBonus: number
  manaRegenBonus: number
}

/** Scale a merc's base DPS by their upgrade level */
export function getScaledMercDPS(merc: Mercenary, level: number): number {
  return Math.floor(merc.baseDPS * (1 + MERC_DPS_PER_LEVEL * (level - 1)))
}

/** Scale a merc's ability value by their upgrade level */
export function getScaledAbilityValue(merc: Mercenary, level: number): number {
  const raw = merc.specialAbility.value * (1 + MERC_ABILITY_PER_LEVEL * (level - 1))
  return Math.round(raw * 1000) / 1000
}

/**
 * Calculate total party bonuses from mercenaries in party slots.
 * mercLevels maps mercId → upgrade level (default 1).
 */
export function getPartyBonuses(partySlots: (string | null)[], mercLevels: Record<string, number> = {}): PartyBonuses {
  const result: PartyBonuses = {
    totalMercDPS: 0,
    flatDPSBonus: 0,
    percentDPSBonus: 0,
    critBoostBonus: 0,
    tokenBoostBonus: 0,
    manaRegenBonus: 0,
  }

  for (const mercId of partySlots) {
    if (!mercId) continue
    const merc = getMercById(mercId)
    if (!merc) continue

    const level = mercLevels[mercId] ?? 1
    result.totalMercDPS += getScaledMercDPS(merc, level)

    const abilityVal = getScaledAbilityValue(merc, level)
    switch (merc.specialAbility.type) {
      case 'flatDPS':
        result.flatDPSBonus += abilityVal
        break
      case 'percentDPS':
        result.percentDPSBonus += abilityVal
        break
      case 'critBoost':
        result.critBoostBonus += abilityVal
        break
      case 'tokenBoost':
        result.tokenBoostBonus += abilityVal
        break
      case 'manaRegen':
        result.manaRegenBonus += abilityVal
        break
    }
  }

  return result
}

/**
 * Calculate total party DPS including merc base DPS + ability bonuses.
 * playerDPS is the player's base DPS before party bonuses.
 */
export function getTotalPartyDPS(playerDPS: number, partyBonuses: PartyBonuses): number {
  const boostedPlayerDPS = Math.floor((playerDPS + partyBonuses.flatDPSBonus) * (1 + partyBonuses.percentDPSBonus))
  return boostedPlayerDPS + partyBonuses.totalMercDPS
}

/**
 * Roll merc crits — each merc rolls independently.
 * mercLevels maps mercId → upgrade level for DPS scaling.
 */
export function rollMercDamage(partySlots: (string | null)[], mercLevels: Record<string, number> = {}): number {
  let total = 0
  for (const mercId of partySlots) {
    if (!mercId) continue
    const merc = getMercById(mercId)
    if (!merc) continue
    const level = mercLevels[mercId] ?? 1
    const dps = getScaledMercDPS(merc, level)
    const isCrit = Math.random() < merc.critChance
    total += isCrit ? Math.floor(dps * 2) : dps
  }
  return total
}
