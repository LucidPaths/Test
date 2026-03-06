import type { ZoneDef } from '../types/zone'

/**
 * 12 zones — one per vesting month (year 1).
 * Each zone has 4-5 regular enemies + 1 boss = ~10 encounters per zone.
 * No enemy names reused across zones. German financial education theme.
 *
 * Cross-file contract: zone IDs referenced by equipmentStore.currentZoneId,
 * zoneProgress keys, and unlock fields in spells/pets/mercenaries data.
 */
export const ZONES: ZoneDef[] = [
  // ── Zone 0: Schulden-Sumpf (Debt Swamp) ──────────────────────────
  {
    id: 'zone-0',
    name: 'Schulden-Sumpf',
    emoji: '🏚️',
    description: 'Hier beginnt die Reise — raus aus den Schulden!',
    unlockMonth: 0,
    baseEnemyHP: 25,
    baseTokenReward: 7,
    enemies: [
      { id: 'z0-e0', name: 'Schulden-Slime', emoji: '🟢', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z0-e1', name: 'Mahngebühr-Motte', emoji: '🦋', hpMultiplier: 1.1, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z0-e2', name: 'Raten-Ratte', emoji: '🐀', hpMultiplier: 0.9, tokenMultiplier: 1.2, traits: [], isBoss: false },
      { id: 'z0-e3', name: 'Dispo-Dunkelelf', emoji: '🧝', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z0-boss', name: 'Schulden-Souverän', emoji: '👑', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['enraged', 'shielded'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Krone der Schuldenfreiheit', emoji: '👑', slot: 'accessory', guaranteedRarity: 'rare', statProfile: 'balanced' },
    ],
    spellUnlock: 'zins-blitz',
    petUnlock: 'spardose',
    mercenaryUnlock: 'starter-gefaehrte',
    completionReward: { tokens: 50 },
  },

  // ── Zone 1: Gebühren-Grotte (Fee Grotto) ─────────────────────────
  {
    id: 'zone-1',
    name: 'Gebühren-Grotte',
    emoji: '🪨',
    description: 'Versteckte Gebühren lauern im Dunkeln.',
    unlockMonth: 1,
    baseEnemyHP: 40,
    baseTokenReward: 10,
    enemies: [
      { id: 'z1-e0', name: 'Kontogebühr-Kobold', emoji: '👺', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z1-e1', name: 'Ausgabe-Assel', emoji: '🪲', hpMultiplier: 0.8, tokenMultiplier: 1.3, traits: ['wealthy'], isBoss: false },
      { id: 'z1-e2', name: 'Provision-Phantom', emoji: '👻', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z1-e3', name: 'Verwaltungs-Vampir', emoji: '🧛', hpMultiplier: 1.1, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z1-boss', name: 'Gebühren-Golem', emoji: '🗿', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['armored', 'enraged'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Gebührenfreier Schild', emoji: '🛡️', slot: 'armor', guaranteedRarity: 'rare', statProfile: 'defense' },
    ],
    mercenaryUnlock: 'steuer-beraterin',
    completionReward: { tokens: 80 },
  },

  // ── Zone 2: Sparplan-Steppe (Savings Steppe) ─────────────────────
  {
    id: 'zone-2',
    name: 'Sparplan-Steppe',
    emoji: '🌾',
    description: 'Regelmäßiges Sparen ist die stärkste Waffe.',
    unlockMonth: 2,
    baseEnemyHP: 60,
    baseTokenReward: 13,
    enemies: [
      { id: 'z2-e0', name: 'Verschwendungs-Wespe', emoji: '🐝', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z2-e1', name: 'Impuls-Igel', emoji: '🦔', hpMultiplier: 1.1, tokenMultiplier: 1.0, traits: ['swift'], isBoss: false },
      { id: 'z2-e2', name: 'Konsum-Krähe', emoji: '🐦', hpMultiplier: 0.9, tokenMultiplier: 1.1, traits: [], isBoss: false },
      { id: 'z2-e3', name: 'Lifestyle-Lurcher', emoji: '🦎', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z2-boss', name: 'Sparplan-Sphinx', emoji: '🦁', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['shielded', 'regenerating'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Sparplan-Schwert', emoji: '⚔️', slot: 'weapon', guaranteedRarity: 'rare', statProfile: 'attack' },
    ],
    spellUnlock: 'spar-schild',
    mercenaryUnlock: 'sparplan-soldat',
    completionReward: { tokens: 110 },
  },

  // ── Zone 3: Zins-Zitadelle (Interest Citadel) ────────────────────
  {
    id: 'zone-3',
    name: 'Zins-Zitadelle',
    emoji: '🏰',
    description: 'Zinseszins ist die stärkste Kraft im Universum.',
    unlockMonth: 3,
    baseEnemyHP: 85,
    baseTokenReward: 16,
    enemies: [
      { id: 'z3-e0', name: 'Niedrigzins-Natter', emoji: '🐍', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['swift'], isBoss: false },
      { id: 'z3-e1', name: 'Strafzins-Spinne', emoji: '🕷️', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: ['cursed'], isBoss: false },
      { id: 'z3-e2', name: 'Tagesgeld-Troll', emoji: '🧌', hpMultiplier: 1.3, tokenMultiplier: 1.1, traits: [], isBoss: false },
      { id: 'z3-e3', name: 'Festgeld-Fledermaus', emoji: '🦇', hpMultiplier: 0.9, tokenMultiplier: 1.2, traits: [], isBoss: false },
      { id: 'z3-boss', name: 'Zins-Zerberus', emoji: '🐕', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['armored', 'enraged', 'regenerating'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Zinseszins-Zepter', emoji: '🔮', slot: 'rune', guaranteedRarity: 'epic', statProfile: 'crit' },
    ],
    petUnlock: 'spar-schwein',
    completionReward: { tokens: 140 },
  },

  // ── Zone 4: Inflations-Insel (Inflation Island) ──────────────────
  {
    id: 'zone-4',
    name: 'Inflations-Insel',
    emoji: '🏝️',
    description: 'Die Preise steigen — dein Geld verliert an Wert.',
    unlockMonth: 4,
    baseEnemyHP: 120,
    baseTokenReward: 19,
    enemies: [
      { id: 'z4-e0', name: 'Inflation-Imp', emoji: '😈', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['enraged'], isBoss: false },
      { id: 'z4-e1', name: 'Teuerungs-Tiger', emoji: '🐅', hpMultiplier: 1.3, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z4-e2', name: 'Kaufkraft-Krake', emoji: '🐙', hpMultiplier: 1.1, tokenMultiplier: 1.1, traits: ['swift'], isBoss: false },
      { id: 'z4-e3', name: 'Preissteigerungs-Poltergeist', emoji: '👾', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: [], isBoss: false },
      { id: 'z4-boss', name: 'Inflations-Imperator', emoji: '🌋', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['enraged', 'cursed', 'wealthy'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Inflationsschutz-Amulett', emoji: '📿', slot: 'accessory', guaranteedRarity: 'epic', statProfile: 'goldFind' },
    ],
    spellUnlock: 'dividenden-dolch',
    mercenaryUnlock: 'dividenden-dieb',
    completionReward: { tokens: 170 },
  },

  // ── Zone 5: Steuer-Schlucht (Tax Canyon) ─────────────────────────
  {
    id: 'zone-5',
    name: 'Steuer-Schlucht',
    emoji: '🏜️',
    description: 'Steuern richtig nutzen — legale Optimierung.',
    unlockMonth: 5,
    baseEnemyHP: 160,
    baseTokenReward: 22,
    enemies: [
      { id: 'z5-e0', name: 'Steuer-Skelett', emoji: '💀', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['armored'], isBoss: false },
      { id: 'z5-e1', name: 'Finanzamt-Frostgeist', emoji: '🥶', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: ['shielded'], isBoss: false },
      { id: 'z5-e2', name: 'Abgaben-Alp', emoji: '😱', hpMultiplier: 1.1, tokenMultiplier: 1.2, traits: [], isBoss: false },
      { id: 'z5-e3', name: 'Nachzahlungs-Ninja', emoji: '🥷', hpMultiplier: 0.8, tokenMultiplier: 1.0, traits: ['swift', 'cursed'], isBoss: false },
      { id: 'z5-boss', name: 'Steuer-Sphinx', emoji: '📜', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['armored', 'shielded', 'enraged'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Freistellungs-Klinge', emoji: '🗡️', slot: 'weapon', guaranteedRarity: 'epic', statProfile: 'attack' },
    ],
    spellUnlock: 'inflationsschutz',
    petUnlock: 'zins-eule',
    completionReward: { tokens: 200 },
  },

  // ── Zone 6: ETF-Ebene (ETF Plains) ───────────────────────────────
  {
    id: 'zone-6',
    name: 'ETF-Ebene',
    emoji: '🌿',
    description: 'Diversifiziert investieren mit ETFs.',
    unlockMonth: 6,
    baseEnemyHP: 210,
    baseTokenReward: 25,
    enemies: [
      { id: 'z6-e0', name: 'Index-Igel', emoji: '🦔', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['armored'], isBoss: false },
      { id: 'z6-e1', name: 'Spread-Spinne', emoji: '🕷️', hpMultiplier: 1.1, tokenMultiplier: 1.0, traits: ['cursed'], isBoss: false },
      { id: 'z6-e2', name: 'TER-Troll', emoji: '🧌', hpMultiplier: 1.3, tokenMultiplier: 1.1, traits: [], isBoss: false },
      { id: 'z6-e3', name: 'Tracking-Phantom', emoji: '👻', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['swift'], isBoss: false },
      { id: 'z6-e4', name: 'Rebalancing-Reiter', emoji: '🏇', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: ['regenerating'], isBoss: false },
      { id: 'z6-boss', name: 'Fond-Fürst', emoji: '🤴', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['armored', 'regenerating', 'enraged'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'ETF-Ewigkeits-Rüstung', emoji: '🛡️', slot: 'armor', guaranteedRarity: 'epic', statProfile: 'defense' },
    ],
    spellUnlock: 'etf-eruption',
    mercenaryUnlock: 'etf-elf',
    completionReward: { tokens: 230 },
  },

  // ── Zone 7: Kredit-Katakomben (Credit Catacombs) ─────────────────
  {
    id: 'zone-7',
    name: 'Kredit-Katakomben',
    emoji: '💀',
    description: 'Kredite verstehen — Chance und Gefahr.',
    unlockMonth: 7,
    baseEnemyHP: 275,
    baseTokenReward: 28,
    enemies: [
      { id: 'z7-e0', name: 'Kredit-Kriecher', emoji: '🪱', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['regenerating'], isBoss: false },
      { id: 'z7-e1', name: 'Zinsfalle-Zombie', emoji: '🧟', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: ['enraged'], isBoss: false },
      { id: 'z7-e2', name: 'Tilgungs-Treant', emoji: '🌳', hpMultiplier: 1.4, tokenMultiplier: 1.0, traits: ['armored'], isBoss: false },
      { id: 'z7-e3', name: 'Schufa-Schatten', emoji: '🌑', hpMultiplier: 1.0, tokenMultiplier: 1.2, traits: ['cursed', 'swift'], isBoss: false },
      { id: 'z7-boss', name: 'Kredit-Koloss', emoji: '🏛️', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['armored', 'shielded', 'regenerating'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Schuldenfrei-Rune', emoji: '✨', slot: 'rune', guaranteedRarity: 'epic', statProfile: 'crit' },
    ],
    petUnlock: 'budget-biene',
    completionReward: { tokens: 260 },
  },

  // ── Zone 8: Börsen-Burg (Stock Castle) ────────────────────────────
  {
    id: 'zone-8',
    name: 'Börsen-Burg',
    emoji: '🏰',
    description: 'Die Börse: Risiko und Rendite in Balance.',
    unlockMonth: 8,
    baseEnemyHP: 350,
    baseTokenReward: 31,
    enemies: [
      { id: 'z8-e0', name: 'Volatilitäts-Vampir', emoji: '🧛', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['swift', 'enraged'], isBoss: false },
      { id: 'z8-e1', name: 'Bären-Berserker', emoji: '🐻', hpMultiplier: 1.4, tokenMultiplier: 1.0, traits: ['enraged'], isBoss: false },
      { id: 'z8-e2', name: 'Crash-Chimäre', emoji: '🦅', hpMultiplier: 1.2, tokenMultiplier: 1.1, traits: ['cursed'], isBoss: false },
      { id: 'z8-e3', name: 'Dividenden-Dämon', emoji: '👹', hpMultiplier: 1.1, tokenMultiplier: 1.3, traits: ['wealthy'], isBoss: false },
      { id: 'z8-e4', name: 'Short-Seller-Schakal', emoji: '🐺', hpMultiplier: 0.9, tokenMultiplier: 1.0, traits: ['swift', 'cursed'], isBoss: false },
      { id: 'z8-boss', name: 'Börsen-Behemoth', emoji: '🐂', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['enraged', 'armored', 'wealthy'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Bullenmarkt-Breitschwert', emoji: '⚔️', slot: 'weapon', guaranteedRarity: 'legendary', statProfile: 'attack' },
    ],
    spellUnlock: 'boersen-berserker',
    mercenaryUnlock: 'boersen-bardin',
    completionReward: { tokens: 290 },
  },

  // ── Zone 9: Diversifikations-Dom (Diversification Cathedral) ─────
  {
    id: 'zone-9',
    name: 'Diversifikations-Dom',
    emoji: '⛪',
    description: 'Nicht alles auf eine Karte setzen.',
    unlockMonth: 9,
    baseEnemyHP: 440,
    baseTokenReward: 34,
    enemies: [
      { id: 'z9-e0', name: 'Klumpenrisiko-Kultist', emoji: '🧙', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: ['cursed', 'armored'], isBoss: false },
      { id: 'z9-e1', name: 'Korrelations-Kobra', emoji: '🐍', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['swift', 'regenerating'], isBoss: false },
      { id: 'z9-e2', name: 'Allokations-Alligator', emoji: '🐊', hpMultiplier: 1.4, tokenMultiplier: 1.1, traits: ['armored'], isBoss: false },
      { id: 'z9-e3', name: 'Sektor-Wetter-Sturm', emoji: '⛈️', hpMultiplier: 1.1, tokenMultiplier: 1.2, traits: ['enraged'], isBoss: false },
      { id: 'z9-boss', name: 'Diversi-Drache', emoji: '🐲', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['enraged', 'regenerating', 'shielded', 'cursed'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Diversifikations-Diamant', emoji: '💎', slot: 'accessory', guaranteedRarity: 'legendary', statProfile: 'balanced' },
    ],
    petUnlock: 'rendite-rabe',
    completionReward: { tokens: 320 },
  },

  // ── Zone 10: Rezessions-Ruinen (Recession Ruins) ─────────────────
  {
    id: 'zone-10',
    name: 'Rezessions-Ruinen',
    emoji: '🏚️',
    description: 'Wirtschaftszyklen: jede Krise birgt Chancen.',
    unlockMonth: 10,
    baseEnemyHP: 550,
    baseTokenReward: 37,
    enemies: [
      { id: 'z10-e0', name: 'Rezessions-Revenant', emoji: '💀', hpMultiplier: 1.2, tokenMultiplier: 1.0, traits: ['enraged', 'cursed'], isBoss: false },
      { id: 'z10-e1', name: 'Deflations-Dschinn', emoji: '🧞', hpMultiplier: 1.1, tokenMultiplier: 1.0, traits: ['shielded', 'swift'], isBoss: false },
      { id: 'z10-e2', name: 'Konjunktur-Koloss', emoji: '🦍', hpMultiplier: 1.5, tokenMultiplier: 1.0, traits: ['armored', 'enraged'], isBoss: false },
      { id: 'z10-e3', name: 'Arbeitsmarkt-Ameise', emoji: '🐜', hpMultiplier: 0.7, tokenMultiplier: 1.5, traits: ['wealthy', 'swift'], isBoss: false },
      { id: 'z10-boss', name: 'Rezessions-Reaper', emoji: '☠️', hpMultiplier: 10.0, tokenMultiplier: 3.0, traits: ['cursed', 'enraged', 'armored', 'regenerating'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Antizyklische Rüstung', emoji: '🛡️', slot: 'armor', guaranteedRarity: 'legendary', statProfile: 'defense' },
    ],
    mercenaryUnlock: 'portfolio-paladin',
    completionReward: { tokens: 350 },
  },

  // ── Zone 11: Vermögens-Vulkan (Wealth Volcano) ───────────────────
  {
    id: 'zone-11',
    name: 'Vermögens-Vulkan',
    emoji: '🌋',
    description: 'Das Finale — 100K im Visier!',
    unlockMonth: 11,
    baseEnemyHP: 700,
    baseTokenReward: 40,
    enemies: [
      { id: 'z11-e0', name: 'Vermögens-Verwalter', emoji: '🧑‍💼', hpMultiplier: 1.3, tokenMultiplier: 1.0, traits: ['armored', 'regenerating'], isBoss: false },
      { id: 'z11-e1', name: 'Erbschafts-Elementar', emoji: '🔥', hpMultiplier: 1.2, tokenMultiplier: 1.2, traits: ['enraged', 'wealthy'], isBoss: false },
      { id: 'z11-e2', name: 'FIRE-Phoenix', emoji: '🦅', hpMultiplier: 1.0, tokenMultiplier: 1.0, traits: ['swift', 'regenerating', 'enraged'], isBoss: false },
      { id: 'z11-e3', name: 'Zinseszins-Zerberus', emoji: '🐺', hpMultiplier: 1.4, tokenMultiplier: 1.0, traits: ['shielded', 'cursed'], isBoss: false },
      { id: 'z11-e4', name: 'Passives-Einkommen-Geist', emoji: '👻', hpMultiplier: 1.1, tokenMultiplier: 1.5, traits: ['wealthy', 'swift'], isBoss: false },
      { id: 'z11-boss', name: 'Vermögens-Vulkan-Titan', emoji: '🔥', hpMultiplier: 10.0, tokenMultiplier: 5.0, traits: ['enraged', 'armored', 'regenerating', 'shielded', 'cursed'], isBoss: true },
    ],
    bossLootTable: [
      { itemNameOverride: 'Krone des Vermögens', emoji: '👑', slot: 'accessory', guaranteedRarity: 'legendary', statProfile: 'balanced' },
      { itemNameOverride: 'Vulkan-Vernichter', emoji: '🗡️', slot: 'weapon', guaranteedRarity: 'legendary', statProfile: 'attack' },
    ],
    spellUnlock: 'vermoegens-vulkanstoss',
    petUnlock: 'diversi-drache',
    completionReward: { tokens: 500 },
  },
]

/** Quick lookup by ID */
export function getZoneById(id: string): ZoneDef | undefined {
  return ZONES.find((z) => z.id === id)
}
