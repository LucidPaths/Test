import type { Spell } from '../types/spell'

/**
 * 7 spells unlocked by clearing zones.
 * Cross-file contract: spell IDs referenced by zones.ts spellUnlock field.
 */
export const SPELLS: Spell[] = [
  {
    id: 'zins-blitz',
    name: 'Zins-Blitz',
    emoji: '⚡',
    description: '3× DPS Sofortschaden',
    unlockZoneId: 'zone-0',
    cooldownMs: 8000,
    manaCost: 10,
    effect: { type: 'damage', multiplier: 3 },
  },
  {
    id: 'spar-schild',
    name: 'Spar-Schild',
    emoji: '🛡️',
    description: '+50% Verteidigung für 10s',
    unlockZoneId: 'zone-2',
    cooldownMs: 15000,
    manaCost: 15,
    effect: { type: 'buff', stat: 'defense', value: 0.5, durationMs: 10000 },
  },
  {
    id: 'dividenden-dolch',
    name: 'Dividenden-Dolch',
    emoji: '🗡️',
    description: 'Gift: 50% DPS × 5 Ticks',
    unlockZoneId: 'zone-4',
    cooldownMs: 12000,
    manaCost: 20,
    effect: { type: 'dot', tickMultiplier: 0.5, ticks: 5 },
  },
  {
    id: 'inflationsschutz',
    name: 'Inflationsschutz',
    emoji: '🔥',
    description: 'Sofort-Kill unter 15% HP',
    unlockZoneId: 'zone-5',
    cooldownMs: 20000,
    manaCost: 25,
    effect: { type: 'execute', hpThreshold: 0.15 },
  },
  {
    id: 'etf-eruption',
    name: 'ETF-Eruption',
    emoji: '💥',
    description: '5× DPS Sofortschaden',
    unlockZoneId: 'zone-6',
    cooldownMs: 10000,
    manaCost: 15,
    effect: { type: 'damage', multiplier: 5 },
  },
  {
    id: 'boersen-berserker',
    name: 'Börsen-Berserker',
    emoji: '😤',
    description: '+100% Angriff für 8s',
    unlockZoneId: 'zone-8',
    cooldownMs: 25000,
    manaCost: 30,
    effect: { type: 'buff', stat: 'attack', value: 1.0, durationMs: 8000 },
  },
  {
    id: 'vermoegens-vulkanstoss',
    name: 'Vermögens-Vulkanstoß',
    emoji: '🌋',
    description: '10× DPS Sofortschaden',
    unlockZoneId: 'zone-11',
    cooldownMs: 30000,
    manaCost: 40,
    effect: { type: 'damage', multiplier: 10 },
  },
]

export function getSpellById(id: string): Spell | undefined {
  return SPELLS.find((s) => s.id === id)
}
