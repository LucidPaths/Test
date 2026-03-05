import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SPELLS } from '../data/spells'
import { isSpellReady } from '../engine/spells'

interface SpellStore {
  unlockedSpellIds: string[]
  equippedSpellIds: string[]    // Max 3 equipped
  cooldowns: Record<string, number>  // spellId -> timestamp when cooldown ends
  autoCast: boolean             // Default: true (idle-friendly)

  unlockSpell: (id: string) => void
  equipSpell: (id: string) => void
  unequipSpell: (id: string) => void
  toggleAutoCast: () => void
  setCooldown: (spellId: string, cooldownMs: number) => void
  getReadySpells: () => string[]
  fullReset: () => void
}

export const useSpellStore = create<SpellStore>()(
  persist(
    (set, get) => ({
      unlockedSpellIds: [],
      equippedSpellIds: [],
      cooldowns: {},
      autoCast: true,

      unlockSpell: (id) =>
        set((s) => ({
          unlockedSpellIds: s.unlockedSpellIds.includes(id) ? s.unlockedSpellIds : [...s.unlockedSpellIds, id],
        })),

      equipSpell: (id) =>
        set((s) => {
          if (s.equippedSpellIds.includes(id)) return s
          if (s.equippedSpellIds.length >= 3) return s // max 3 slots
          if (!s.unlockedSpellIds.includes(id)) return s
          return { equippedSpellIds: [...s.equippedSpellIds, id] }
        }),

      unequipSpell: (id) =>
        set((s) => ({
          equippedSpellIds: s.equippedSpellIds.filter((sid) => sid !== id),
        })),

      toggleAutoCast: () => set((s) => ({ autoCast: !s.autoCast })),

      setCooldown: (spellId, cooldownMs) =>
        set((s) => ({
          cooldowns: { ...s.cooldowns, [spellId]: Date.now() + cooldownMs },
        })),

      getReadySpells: () => {
        const state = get()
        return state.equippedSpellIds.filter((id) => isSpellReady(id, state.cooldowns))
      },

      fullReset: () => set({
        unlockedSpellIds: [],
        equippedSpellIds: [],
        cooldowns: {},
        autoCast: true,
      }),
    }),
    {
      name: '100k-spells-v1',
      partialize: (state) => ({
        unlockedSpellIds: state.unlockedSpellIds,
        equippedSpellIds: state.equippedSpellIds,
        autoCast: state.autoCast,
        // cooldowns are transient
      }),
    }
  )
)
