import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGameStore } from './gameStore'

interface MercenaryStore {
  recruitedIds: string[]
  partySlots: [string | null, string | null]  // Max 2 party members

  recruit: (mercId: string, cost: number) => boolean  // Spends tokens
  addToParty: (mercId: string) => void
  removeFromParty: (slotIndex: number) => void
  fullReset: () => void
}

export const useMercenaryStore = create<MercenaryStore>()(
  persist(
    (set, get) => ({
      recruitedIds: [],
      partySlots: [null, null],

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
          // Already in party?
          if (s.partySlots.includes(mercId)) return s
          // Find empty slot
          const slots: [string | null, string | null] = [...s.partySlots]
          const emptyIdx = slots.findIndex((s) => s === null)
          if (emptyIdx === -1) return s // party full
          slots[emptyIdx] = mercId
          return { partySlots: slots }
        }),

      removeFromParty: (slotIndex) =>
        set((s) => {
          if (slotIndex < 0 || slotIndex > 1) return s
          const slots: [string | null, string | null] = [...s.partySlots]
          slots[slotIndex] = null
          return { partySlots: slots }
        }),

      fullReset: () => set({
        recruitedIds: [],
        partySlots: [null, null],
      }),
    }),
    { name: '100k-mercenaries-v1' }
  )
)
