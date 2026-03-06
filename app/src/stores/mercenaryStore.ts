import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGameStore } from './gameStore'
import { BASE_PARTY_SLOTS, MAX_PARTY_SLOTS, MERC_UPGRADE_BASE_COST, MERC_UPGRADE_COST_SCALE, MAX_MERC_LEVEL } from '../constants/gameBalances'

interface MercenaryStore {
  recruitedIds: string[]
  partySlots: (string | null)[]  // Dynamic length, starts at BASE_PARTY_SLOTS
  unlockedSlots: number          // How many slots the player has unlocked (starts at BASE_PARTY_SLOTS)
  mercLevels: Record<string, number>  // mercId → upgrade level (starts at 1 after recruit)

  recruit: (mercId: string, cost: number) => boolean  // Spends tokens
  addToParty: (mercId: string) => void
  removeFromParty: (slotIndex: number) => void
  unlockPartySlot: () => void    // Adds one more slot (up to MAX_PARTY_SLOTS)
  upgradeMerc: (mercId: string) => boolean  // Spends tokens, returns success
  fullReset: () => void
}

function makeSlots(count: number): (string | null)[] {
  return Array.from({ length: count }, () => null)
}

/** Token cost for upgrading a merc from currentLevel to currentLevel+1 */
export function getMercUpgradeCost(currentLevel: number): number {
  return Math.floor(MERC_UPGRADE_BASE_COST * Math.pow(MERC_UPGRADE_COST_SCALE, currentLevel - 1))
}

export const useMercenaryStore = create<MercenaryStore>()(
  persist(
    (set, get) => ({
      recruitedIds: [],
      partySlots: makeSlots(BASE_PARTY_SLOTS),
      unlockedSlots: BASE_PARTY_SLOTS,
      mercLevels: {},

      recruit: (mercId, cost) => {
        const state = get()
        if (state.recruitedIds.includes(mercId)) return false
        const canAfford = useGameStore.getState().spendTokens(cost)
        if (!canAfford) return false
        set({
          recruitedIds: [...state.recruitedIds, mercId],
          mercLevels: { ...state.mercLevels, [mercId]: 1 },
        })
        return true
      },

      addToParty: (mercId) =>
        set((s) => {
          if (!s.recruitedIds.includes(mercId)) return s
          if (s.partySlots.includes(mercId)) return s
          const slots = [...s.partySlots]
          const emptyIdx = slots.findIndex((slot) => slot === null)
          if (emptyIdx === -1) return s
          slots[emptyIdx] = mercId
          return { partySlots: slots }
        }),

      removeFromParty: (slotIndex) =>
        set((s) => {
          if (slotIndex < 0 || slotIndex >= s.partySlots.length) return s
          const slots = [...s.partySlots]
          slots[slotIndex] = null
          return { partySlots: slots }
        }),

      unlockPartySlot: () =>
        set((s) => {
          if (s.unlockedSlots >= MAX_PARTY_SLOTS) return s
          const newCount = s.unlockedSlots + 1
          // Extend partySlots array with a new null slot
          const slots = [...s.partySlots, null]
          return { unlockedSlots: newCount, partySlots: slots }
        }),

      upgradeMerc: (mercId) => {
        const state = get()
        if (!state.recruitedIds.includes(mercId)) return false
        const currentLevel = state.mercLevels[mercId] ?? 1
        if (currentLevel >= MAX_MERC_LEVEL) return false
        const cost = getMercUpgradeCost(currentLevel)
        const canAfford = useGameStore.getState().spendTokens(cost)
        if (!canAfford) return false
        set({ mercLevels: { ...state.mercLevels, [mercId]: currentLevel + 1 } })
        return true
      },

      fullReset: () => set({
        recruitedIds: [],
        partySlots: makeSlots(BASE_PARTY_SLOTS),
        unlockedSlots: BASE_PARTY_SLOTS,
        mercLevels: {},
      }),
    }),
    { name: '100k-mercenaries-v1' }
  )
)
