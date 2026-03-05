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
export const MAX_PARTY_SLOTS = 2

// ── Savings / Onboarding ──
export const AGE_MIN = 14
export const AGE_MAX = 65
export const MONTHLY_CONTRIBUTION_MIN = 25
export const MONTHLY_CONTRIBUTION_MAX = 1000
export const MAX_TRANSACTION_HISTORY = 50

// ── Combat ──
export const ATTACK_INTERVAL_MS = 1000
