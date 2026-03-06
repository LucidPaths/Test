import type { Pet } from '../types/pet'

/**
 * 6 pets unlocked by clearing zones 0, 3, 5, 7, 9, 11.
 * Cross-file contract: pet IDs referenced by zones.ts petUnlock field.
 */
export const PETS: Pet[] = [
  {
    id: 'spardose',
    name: 'Spardose',
    emoji: '🐖',
    description: 'Dein treuer Begleiter von Anfang an.',
    unlockZoneId: 'zone-0',
    passiveBonus: { stat: 'goldFind', value: 0.05, isMultiplier: false },
    evolution: [
      { level: 5, name: 'Golddose', emoji: '🪙', bonusMultiplier: 2.0 },
      { level: 15, name: 'Schatztruhe', emoji: '📦', bonusMultiplier: 3.0 },
    ],
  },
  {
    id: 'spar-schwein',
    name: 'Spar-Schwein',
    emoji: '🐷',
    description: 'Mehr Token-Drops durch Sparsamkeit.',
    unlockZoneId: 'zone-3',
    passiveBonus: { stat: 'goldFind', value: 0.10, isMultiplier: false },
    evolution: [
      { level: 5, name: 'Goldferkel', emoji: '🐖', bonusMultiplier: 2.0 },
      { level: 15, name: 'Goldschwein', emoji: '🐗', bonusMultiplier: 3.5 },
    ],
  },
  {
    id: 'zins-eule',
    name: 'Zins-Eule',
    emoji: '🦉',
    description: 'Weisheit bringt kritische Treffer.',
    unlockZoneId: 'zone-5',
    passiveBonus: { stat: 'critChance', value: 0.05, isMultiplier: false },
    evolution: [
      { level: 5, name: 'Zins-Uhu', emoji: '🦅', bonusMultiplier: 1.6 },
      { level: 15, name: 'Zins-Phönix', emoji: '🔥', bonusMultiplier: 2.4 },
    ],
  },
  {
    id: 'budget-biene',
    name: 'Budget-Biene',
    emoji: '🐝',
    description: 'Fleißige Mana-Regeneration.',
    unlockZoneId: 'zone-7',
    passiveBonus: { stat: 'manaRegen', value: 1, isMultiplier: false },
    evolution: [
      { level: 5, name: 'Honig-Hummel', emoji: '🐝', bonusMultiplier: 2.0 },
      { level: 15, name: 'Goldene Biene', emoji: '✨', bonusMultiplier: 3.0 },
    ],
  },
  {
    id: 'rendite-rabe',
    name: 'Rendite-Rabe',
    emoji: '🐦‍⬛',
    description: 'Rendite steigert deine Angriffskraft.',
    unlockZoneId: 'zone-9',
    passiveBonus: { stat: 'attack', value: 0.15, isMultiplier: true },
    evolution: [
      { level: 5, name: 'Profit-Falke', emoji: '🦅', bonusMultiplier: 1.67 },
      { level: 15, name: 'Dividenden-Adler', emoji: '🦅', bonusMultiplier: 2.67 },
    ],
  },
  {
    id: 'diversi-drache',
    name: 'Diversi-Drache',
    emoji: '🐉',
    description: 'Diversifikation stärkt alle Werte.',
    unlockZoneId: 'zone-11',
    passiveBonus: { stat: 'allStats', value: 0.08, isMultiplier: true },
    evolution: [
      { level: 5, name: 'Streuungs-Drache', emoji: '🐉', bonusMultiplier: 1.5 },
      { level: 15, name: 'Portfolio-Drache', emoji: '🐲', bonusMultiplier: 2.25 },
    ],
  },
]

export function getPetById(id: string): Pet | undefined {
  return PETS.find((p) => p.id === id)
}
