import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGameStore } from './gameStore'
import { BASE_PARTY_SLOTS, MAX_PARTY_SLOTS } from '../constants/gameBalances'

interface MercenaryStore {
  recruitedIds: string[]
  partySlots: (string | null)[]  // Dynamic length, starts at BASE_PARTY_SLOTS
  unlockedSlots: number          // How many slots the player has unlocked (starts at BASE_PARTY_SLOTS)

  recruit: (mercId: string, cost: number) => boolean  // Spends tokens
  addToParty: (mercId: string) => void
  removeFromParty: (slotIndex: number) => void
  unlockPartySlot: () => void    // Adds one more slot (up to MAX_PARTY_SLOTS)
  fullReset: () => void
}

function makeSlots(count: number): (string | null)[] {
  return Array.from({ length: count }, () => null)
}

export const useMercenaryStore = create<MercenaryStore>()(
  persist(
    (set, get) => ({
      recruitedIds: [],
      partySlots: makeSlots(BASE_PARTY_SLOTS),
      unlockedSlots: BASE_PARTY_SLOTS,

      recruit: (mercId, cost) => {
        const state = get()
        if (state.recruitedIds.includes(mercId)) return false
        const canAfford = useGameStore.getState().spendTokens(cost)
        if (!canAfford) return false
        set({ recruitedIds: [...state.recruitedIds, mercId] })
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

      fullReset: () => set({
        recruitedIds: [],
        partySlots: makeSlots(BASE_PARTY_SLOTS),
        unlockedSlots: BASE_PARTY_SLOTS,
      }),
    }),
    { name: '100k-mercenaries-v1' }
  )
)
