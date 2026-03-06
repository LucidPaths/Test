import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PetState } from '../types/pet'
import { getPetXPToNext } from '../engine/pets'

interface PetStore {
  unlockedPetIds: string[]
  equippedPetId: string | null
  petStates: Record<string, PetState>

  unlockPet: (id: string) => void
  equipPet: (id: string) => void
  unequipPet: () => void
  addPetXP: (amount: number) => void  // Adds to equipped pet only
  fullReset: () => void
}

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      unlockedPetIds: [],
      equippedPetId: null,
      petStates: {},

      unlockPet: (id) =>
        set((s) => {
          if (s.unlockedPetIds.includes(id)) return s
          return {
            unlockedPetIds: [...s.unlockedPetIds, id],
            petStates: { ...s.petStates, [id]: { level: 1, xp: 0 } },
            // Auto-equip first pet
            equippedPetId: s.equippedPetId ?? id,
          }
        }),

      equipPet: (id) =>
        set((s) => {
          if (!s.unlockedPetIds.includes(id)) return s
          return { equippedPetId: id }
        }),

      unequipPet: () => set({ equippedPetId: null }),

      addPetXP: (amount) => {
        const state = get()
        if (!state.equippedPetId) return
        const petId = state.equippedPetId
        const current = state.petStates[petId] ?? { level: 1, xp: 0 }
        let xp = current.xp + amount
        let level = current.level

        // Level up loop
        let xpNeeded = getPetXPToNext(level)
        while (xp >= xpNeeded) {
          xp -= xpNeeded
          level++
          xpNeeded = getPetXPToNext(level)
        }

        set({
          petStates: { ...state.petStates, [petId]: { level, xp } },
        })
      },

      fullReset: () => set({
        unlockedPetIds: [],
        equippedPetId: null,
        petStates: {},
      }),
    }),
    { name: '100k-pets-v1' }
  )
)
