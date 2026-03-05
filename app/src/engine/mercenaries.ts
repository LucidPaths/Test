import type { Mercenary } from '../types/mercenary'
import { MERCENARIES } from '../data/mercenaries'

export interface PartyBonuses {
  totalMercDPS: number
  flatDPSBonus: number
  percentDPSBonus: number
  critBoostBonus: number
  tokenBoostBonus: number
  manaRegenBonus: number
}

/**
 * Calculate total party bonuses from mercenaries in party slots.
 * Mercs are equal partners — their baseDPS is real damage dealt per tick.
 */
export function getPartyBonuses(partySlots: (string | null)[]): PartyBonuses {
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
    const merc = MERCENARIES.find((m) => m.id === mercId)
    if (!merc) continue

    result.totalMercDPS += merc.baseDPS

    switch (merc.specialAbility.type) {
      case 'flatDPS':
        result.flatDPSBonus += merc.specialAbility.value
        break
      case 'percentDPS':
        result.percentDPSBonus += merc.specialAbility.value
        break
      case 'critBoost':
        result.critBoostBonus += merc.specialAbility.value
        break
      case 'tokenBoost':
        result.tokenBoostBonus += merc.specialAbility.value
        break
      case 'manaRegen':
        result.manaRegenBonus += merc.specialAbility.value
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
 * Returns total merc crit damage for this tick.
 */
export function rollMercDamage(partySlots: (string | null)[]): number {
  let total = 0
  for (const mercId of partySlots) {
    if (!mercId) continue
    const merc = MERCENARIES.find((m) => m.id === mercId)
    if (!merc) continue
    const isCrit = Math.random() < merc.critChance
    total += isCrit ? Math.floor(merc.baseDPS * 2) : merc.baseDPS
  }
  return total
}
