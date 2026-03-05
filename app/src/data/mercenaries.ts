import type { Mercenary } from '../types/mercenary'

/**
 * 6 mercenaries unlocked by clearing zones 1, 2, 4, 6, 8, 10.
 * Equal partners: mercs deal real DPS alongside the player.
 * Cross-file contract: merc IDs referenced by zones.ts mercenaryUnlock field.
 */
export const MERCENARIES: Mercenary[] = [
  {
    id: 'steuer-beraterin',
    name: 'Steuer-Beraterin',
    emoji: '👩‍💼',
    description: 'Optimiert deine Token-Einnahmen.',
    unlockZoneId: 'zone-1',
    recruitCost: 50,
    baseDPS: 8,
    critChance: 0.05,
    specialAbility: {
      name: 'Steueroptimierung',
      emoji: '📋',
      description: '+15% Token-Drops',
      type: 'tokenBoost',
      value: 0.15,
    },
    financialLesson: 'Eine gute Steuerberatung spart dir langfristig mehr Geld als sie kostet.',
  },
  {
    id: 'sparplan-soldat',
    name: 'Sparplan-Soldat',
    emoji: '⚔️',
    description: 'Disziplinierter Kämpfer mit konstantem Schaden.',
    unlockZoneId: 'zone-2',
    recruitCost: 80,
    baseDPS: 12,
    critChance: 0.08,
    specialAbility: {
      name: 'Disziplin-Aura',
      emoji: '💪',
      description: '+10% Krit für Spieler',
      type: 'critBoost',
      value: 0.10,
    },
    financialLesson: 'Regelmäßiges Sparen schlägt auf Dauer jede Einzelinvestition.',
  },
  {
    id: 'dividenden-dieb',
    name: 'Dividenden-Dieb',
    emoji: '🗡️',
    description: 'Schneller Angreifer mit hoher Krit-Chance.',
    unlockZoneId: 'zone-4',
    recruitCost: 120,
    baseDPS: 20,
    critChance: 0.15,
    specialAbility: {
      name: 'Dividenden-Raub',
      emoji: '💰',
      description: '+5% Krit (eigene)',
      type: 'critBoost',
      value: 0.05,
    },
    financialLesson: 'Dividenden sind passives Einkommen — dein Geld arbeitet für dich.',
  },
  {
    id: 'etf-elf',
    name: 'ETF-Elf',
    emoji: '🧝',
    description: 'Magischer Verstärker für die gesamte Gruppe.',
    unlockZoneId: 'zone-6',
    recruitCost: 200,
    baseDPS: 35,
    critChance: 0.10,
    specialAbility: {
      name: 'Diversifikations-Magie',
      emoji: '✨',
      description: '+25% Gruppen-DPS',
      type: 'percentDPS',
      value: 0.25,
    },
    financialLesson: 'ETFs streuen dein Risiko auf hunderte Unternehmen gleichzeitig.',
  },
  {
    id: 'boersen-bardin',
    name: 'Börsen-Bardin',
    emoji: '🎵',
    description: 'Ihre Lieder regenerieren Mana.',
    unlockZoneId: 'zone-8',
    recruitCost: 300,
    baseDPS: 50,
    critChance: 0.10,
    specialAbility: {
      name: 'Marktharmonie',
      emoji: '🎶',
      description: '+2 Mana-Regeneration',
      type: 'manaRegen',
      value: 2,
    },
    financialLesson: 'Geduld und Timing sind an der Börse wichtiger als Geschwindigkeit.',
  },
  {
    id: 'portfolio-paladin',
    name: 'Portfolio-Paladin',
    emoji: '🛡️',
    description: 'Schwerer Nahkämpfer mit enormem Schaden.',
    unlockZoneId: 'zone-10',
    recruitCost: 500,
    baseDPS: 75,
    critChance: 0.12,
    specialAbility: {
      name: 'Vermögensschild',
      emoji: '🛡️',
      description: '+40 fester DPS',
      type: 'flatDPS',
      value: 40,
    },
    financialLesson: 'Ein ausgewogenes Portfolio schützt dich in jeder Marktlage.',
  },
]

export function getMercById(id: string): Mercenary | undefined {
  return MERCENARIES.find((m) => m.id === id)
}
