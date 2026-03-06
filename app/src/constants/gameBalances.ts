/**
 * Game balance constants — single source of truth.
 *
 * If a number appears in more than one place (store init, reset, UI display),
 * it MUST live here. Import it; never hardcode.
 */

// ── Inventory ──
export const INVENTORY_CAP = 100

// ── Mana ──
export const INITIAL_MANA = 50
export const INITIAL_MAX_MANA = 50

// ── Spells ──
export const MAX_EQUIPPED_SPELLS = 3

// ── Party ──
export const BASE_PARTY_SLOTS = 1           // 1 slot unlocked by default
export const MAX_PARTY_SLOTS = 5            // Maximum party size
// Slot 2: free — unlocks after first vesting (simulatedMonths >= 1)
// Slots 3-5: paid via micro-investment
export const PARTY_SLOT_COSTS: Record<number, number> = {
  3: 5,   // €5
  4: 10,  // €10
  5: 20,  // €20
}

// ── Mercenary Upgrades ──
export const MERC_UPGRADE_BASE_COST = 30     // Token cost for level 1→2
export const MERC_UPGRADE_COST_SCALE = 1.5   // Each level costs 1.5× more
export const MAX_MERC_LEVEL = 10             // Maximum merc upgrade level
export const MERC_DPS_PER_LEVEL = 0.15       // +15% base DPS per upgrade level
export const MERC_ABILITY_PER_LEVEL = 0.10   // +10% ability value per upgrade level

// ── Savings / Projection ──
// PROJECTION_RATE: default rate shown in onboarding pitch AND compound curve chart
// when no products are active. Represents realistic long-term blended return (4%).
// Cross-file contract: OnboardingView + CompoundCurve both import this.
export const PROJECTION_RATE = 0.04
export const AGE_MIN = 14
export const AGE_MAX = 65
export const MONTHLY_CONTRIBUTION_MIN = 25
export const MONTHLY_CONTRIBUTION_MAX = 1000
export const MAX_TRANSACTION_HISTORY = 50

// ── Combat ──
export const ATTACK_INTERVAL_MS = 1000

// ── Character names/emojis by gender ──
export const CHARACTER_INFO = {
  male: { name: 'Sparritter', emoji: '🧙' },
  female: { name: 'Sparmagierin', emoji: '🧙‍♀️' },
} as const
