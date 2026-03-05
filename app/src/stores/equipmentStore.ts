import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GearItem, EquipSlot } from '../types/equipment'

interface EquipmentStore {
  // Inventory — all collected gear
  inventory: GearItem[]
  // Equipped gear — one per slot
  equipped: Partial<Record<EquipSlot, GearItem>>
  // Combat stage — advances when enemies are killed
  stage: number
  // Pity counter — counts consecutive common/uncommon drops
  pityCounter: number
  // Highest stage reached (for prestige tracking)
  highestStage: number

  // Actions
  addToInventory: (item: GearItem) => void
  equip: (item: GearItem) => void
  unequip: (slot: EquipSlot) => void
  advanceStage: () => void
  setPityCounter: (n: number) => void
  // Upgrade item rarity + stats in place
  upgradeItem: (itemId: string, newRarity: GearItem['rarity'], statMultiplier: number) => void
  // Prestige: reset stage but keep legendary gear
  prestigeReset: () => void
  fullReset: () => void
}

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      inventory: [],
      equipped: {},
      stage: 1,
      pityCounter: 0,
      highestStage: 1,

      addToInventory: (item) =>
        set((s) => ({
          inventory: [item, ...s.inventory].slice(0, 50), // cap at 50 items
        })),

      equip: (item) =>
        set((s) => ({
          equipped: { ...s.equipped, [item.slot]: item },
        })),

      unequip: (slot) =>
        set((s) => {
          const next = { ...s.equipped }
          delete next[slot]
          return { equipped: next }
        }),

      advanceStage: () =>
        set((s) => {
          const next = s.stage + 1
          return {
            stage: next,
            highestStage: Math.max(s.highestStage, next),
          }
        }),

      setPityCounter: (n) => set({ pityCounter: n }),

      upgradeItem: (itemId, newRarity, statMultiplier) =>
        set((s) => {
          const upgrade = (item: GearItem): GearItem => ({
            ...item,
            rarity: newRarity,
            attack: item.attack > 0 ? Math.floor(item.attack * statMultiplier) : 0,
            defense: item.defense > 0 ? Math.floor(item.defense * statMultiplier) : 0,
            critChance: item.critChance > 0 ? Math.round(item.critChance * statMultiplier * 1000) / 1000 : 0,
            goldFind: item.goldFind > 0 ? Math.round(item.goldFind * statMultiplier * 100) / 100 : 0,
          })
          const newInventory = s.inventory.map((i) => (i.id === itemId ? upgrade(i) : i))
          const newEquipped = { ...s.equipped }
          for (const slot of Object.keys(newEquipped) as EquipSlot[]) {
            if (newEquipped[slot]?.id === itemId) {
              newEquipped[slot] = upgrade(newEquipped[slot]!)
            }
          }
          return { inventory: newInventory, equipped: newEquipped }
        }),

      // Monthly prestige: reset stage to 1, clear non-legendary inventory
      prestigeReset: () => {
        const state = get()
        const legendaryGear = state.inventory.filter((i) => i.rarity === 'legendary')
        set({
          stage: 1,
          pityCounter: 0,
          inventory: legendaryGear,
          // Keep equipped items
        })
      },

      fullReset: () =>
        set({
          inventory: [],
          equipped: {},
          stage: 1,
          pityCounter: 0,
          highestStage: 1,
        }),
    }),
    { name: '100k-equipment-v1' }
  )
)

/**
 * Compute total gear stat bonuses from equipped items.
 */
export function getGearBonuses(equipped: Partial<Record<EquipSlot, GearItem>>) {
  let attack = 0
  let defense = 0
  let critChance = 0
  let goldFind = 0

  for (const item of Object.values(equipped)) {
    if (!item) continue
    attack += item.attack
    defense += item.defense
    critChance += item.critChance
    goldFind += item.goldFind
  }

  return { attack, defense, critChance, goldFind }
}
