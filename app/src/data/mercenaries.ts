import type { Mercenary } from '../types/mercenary'
import type { Gender } from '../stores/savingsStore'

/**
 * 7 mercenaries unlocked by clearing zones 0, 1, 2, 4, 6, 8, 10.
 * The starter merc (zone-0) is the unchosen gender character.
 * Equal partners: mercs deal real DPS alongside the player.
 * Cross-file contract: merc IDs referenced by zones.ts mercenaryUnlock field.
 */

/** Starter merc definition depends on player gender — unchosen gender becomes the first companion */
const STARTER_MERC_VARIANTS: Record<Gender, Omit<Mercenary, 'id' | 'unlockZoneId' | 'recruitCost'>> = {
  // If player chose male (Sparritter), unchosen is female (Sparmagierin)
  male: {
    name: 'Sparmagierin',
    emoji: '🧙‍♀️',
    description: 'Deine erste Gefährtin — Magie des Zinseszins.',
    baseDPS: 5,
    critChance: 0.05,
    specialAbility: { name: 'Zins-Aura', emoji: '✨', description: '+1 Mana-Regeneration', type: 'manaRegen', value: 1 },
    financialLesson: 'Zusammen spart es sich leichter als allein.',
  },
  // If player chose female (Sparmagierin), unchosen is male (Sparritter)
  female: {
    name: 'Sparritter',
    emoji: '🧙',
    description: 'Dein erster Gefährte — Stärke der Disziplin.',
    baseDPS: 5,
    critChance: 0.05,
    specialAbility: { name: 'Disziplin-Stoß', emoji: '⚔️', description: '+10% Gruppen-DPS', type: 'percentDPS', value: 0.10 },
    financialLesson: 'Zusammen spart es sich leichter als allein.',
  },
}

/** Get the starter merc for a given player gender */
export function getStarterMerc(playerGender: Gender): Mercenary {
  const variant = STARTER_MERC_VARIANTS[playerGender]
  return { id: 'starter-gefaehrte', unlockZoneId: 'zone-0', recruitCost: 0, ...variant }
}

export const MERCENARIES: Mercenary[] = [
  // Starter merc placeholder — actual data resolved via getStarterMerc(gender)
  // This entry is used for iteration; display properties are overridden at runtime
  { id: 'starter-gefaehrte', name: 'Gefährte', emoji: '👤', description: 'Dein erster Verbündeter.', unlockZoneId: 'zone-0', recruitCost: 0, baseDPS: 5, critChance: 0.05, specialAbility: { name: 'Gefährten-Kraft', emoji: '👥', description: 'Grundbonus', type: 'percentDPS', value: 0.10 }, financialLesson: 'Zusammen spart es sich leichter als allein.' },
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

/**
 * Get merc by ID. For the starter merc, pass playerGender to resolve the correct variant.
 * Falls back to the generic placeholder if gender is not provided.
 */
export function getMercById(id: string, playerGender?: Gender): Mercenary | undefined {
  if (id === 'starter-gefaehrte' && playerGender) {
    return getStarterMerc(playerGender)
  }
  return MERCENARIES.find((m) => m.id === id)
}
