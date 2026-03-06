import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GearItem, EquipSlot } from '../types/equipment'
import type { ZoneProgress } from '../types/zone'
import { ZONES } from '../data/zones'
import { generateEncounterSequence } from '../engine/zones'
import { INVENTORY_CAP } from '../constants/gameBalances'

interface EquipmentStore {
  // Inventory — all collected gear
  inventory: GearItem[]
  // Equipped gear — one per slot
  equipped: Partial<Record<EquipSlot, GearItem>>
  // Combat stage — legacy total, kept for stats display
  stage: number
  // Pity counter — counts consecutive common/uncommon drops
  pityCounter: number
  // Highest stage reached (lifetime stat)
  highestStage: number

  // ── Zone system ──
  currentZoneId: string
  encounter: number                    // 1-10 within current zone
  zoneProgress: Record<string, ZoneProgress>
  encounterSequence: string[]          // Transient: shuffled enemy IDs for current run

  // Actions
  addToInventory: (item: GearItem) => void
  equip: (item: GearItem) => void
  unequip: (slot: EquipSlot) => void
  advanceEncounter: () => void
  setPityCounter: (n: number) => void
  upgradeItem: (itemId: string, newRarity: GearItem['rarity'], statMultiplier: number) => void
  selectZone: (zoneId: string) => void
  markZoneEncounterDefeated: () => void
  markZoneCleared: () => void
  // Prestige: reset encounter but keep zone progress
  prestigeReset: () => void
  fullReset: () => void
}

function createDefaultZoneProgress(): ZoneProgress {
  return { cleared: false, encountersDefeated: 0, bestRun: 0, timesCleared: 0, bossDefeated: false }
}

function initEncounterSequence(zoneId: string): string[] {
  const zone = ZONES.find((z) => z.id === zoneId)
  if (!zone) {
    console.error(`initEncounterSequence: zone "${zoneId}" not found in ZONES data. Falling back to zone-0.`)
    const fallback = ZONES[0]
    if (!fallback) return []
    return generateEncounterSequence(fallback)
  }
  try {
    return generateEncounterSequence(zone)
  } catch (err) {
    console.error(`initEncounterSequence: failed for zone "${zoneId}": ${err instanceof Error ? err.message : err}. Check zone data has a boss enemy.`)
    return []
  }
}

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      inventory: [],
      equipped: {},
      stage: 1,
      pityCounter: 0,
      highestStage: 1,
      currentZoneId: 'zone-0',
      encounter: 1,
      zoneProgress: { 'zone-0': createDefaultZoneProgress() },
      encounterSequence: initEncounterSequence('zone-0'),

      addToInventory: (item) =>
        set((s) => ({
          inventory: [item, ...s.inventory].slice(0, INVENTORY_CAP),
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

      advanceEncounter: () =>
        set((s) => {
          const next = s.encounter + 1
          const totalStage = s.stage + 1
          return {
            encounter: next,
            stage: totalStage,
            highestStage: Math.max(s.highestStage, totalStage),
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

      selectZone: (zoneId) => {
        const state = get()
        const progress = state.zoneProgress[zoneId] ?? createDefaultZoneProgress()
        const sequence = initEncounterSequence(zoneId)
        set({
          currentZoneId: zoneId,
          encounter: 1,
          encounterSequence: sequence,
          zoneProgress: { ...state.zoneProgress, [zoneId]: { ...progress, encountersDefeated: 0 } },
        })
      },

      markZoneEncounterDefeated: () =>
        set((s) => {
          const zoneId = s.currentZoneId
          const prev = s.zoneProgress[zoneId] ?? createDefaultZoneProgress()
          const defeated = prev.encountersDefeated + 1
          return {
            zoneProgress: {
              ...s.zoneProgress,
              [zoneId]: {
                ...prev,
                encountersDefeated: defeated,
                bestRun: Math.max(prev.bestRun, defeated),
              },
            },
          }
        }),

      markZoneCleared: () =>
        set((s) => {
          const zoneId = s.currentZoneId
          const prev = s.zoneProgress[zoneId] ?? createDefaultZoneProgress()
          const totalEncounters = s.encounterSequence.length
          return {
            zoneProgress: {
              ...s.zoneProgress,
              [zoneId]: {
                ...prev,
                cleared: true,
                bossDefeated: true,
                timesCleared: prev.timesCleared + 1,
                encountersDefeated: totalEncounters,
                bestRun: Math.max(prev.bestRun, totalEncounters),
              },
            },
          }
        }),

      // Prestige: reset encounter in current zone, keep zone progress, clear non-legendary gear
      prestigeReset: () => {
        const state = get()
        const legendaryGear = state.inventory.filter((i) => i.rarity === 'legendary')
        const sequence = initEncounterSequence(state.currentZoneId)
        set({
          encounter: 1,
          pityCounter: 0,
          inventory: legendaryGear,
          encounterSequence: sequence,
        })
      },

      fullReset: () =>
        set({
          inventory: [],
          equipped: {},
          stage: 1,
          pityCounter: 0,
          highestStage: 1,
          currentZoneId: 'zone-0',
          encounter: 1,
          zoneProgress: { 'zone-0': createDefaultZoneProgress() },
          encounterSequence: initEncounterSequence('zone-0'),
        }),
    }),
    {
      name: '100k-equipment-v2',
      partialize: (state) => ({
        inventory: state.inventory,
        equipped: state.equipped,
        stage: state.stage,
        pityCounter: state.pityCounter,
        highestStage: state.highestStage,
        currentZoneId: state.currentZoneId,
        encounter: state.encounter,
        zoneProgress: state.zoneProgress,
        // encounterSequence is transient — NOT persisted
      }),
    }
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
