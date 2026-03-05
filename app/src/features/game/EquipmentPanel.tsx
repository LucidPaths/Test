import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEquipmentStore, getGearBonuses } from '../../stores/equipmentStore'
import type { GearItem, EquipSlot } from '../../types/equipment'
import { RARITY_CONFIG, SLOT_LABELS } from '../../types/equipment'

const SLOTS: EquipSlot[] = ['weapon', 'armor', 'accessory', 'rune']

export function EquipmentPanel() {
  const equipped = useEquipmentStore((s) => s.equipped)
  const inventory = useEquipmentStore((s) => s.inventory)
  const equip = useEquipmentStore((s) => s.equip)
  const unequip = useEquipmentStore((s) => s.unequip)
  const [showInventory, setShowInventory] = useState(false)
  const [filterSlot, setFilterSlot] = useState<EquipSlot | null>(null)

  const gear = getGearBonuses(equipped)

  const filteredInventory = filterSlot
    ? inventory.filter((i) => i.slot === filterSlot)
    : inventory

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="font-pixel text-[9px] text-rpg-text">Ausrüstung</span>
        <button
          onClick={() => setShowInventory(!showInventory)}
          className="font-pixel text-[7px] text-rpg-muted cursor-pointer hover:text-gold transition-colors"
        >
          {showInventory ? '▲ Schließen' : `▼ Inventar (${inventory.length})`}
        </button>
      </div>

      {/* Equipped slots */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {SLOTS.map((slot) => {
          const item = equipped[slot]
          const slotInfo = SLOT_LABELS[slot]
          return (
            <button
              key={slot}
              onClick={() => {
                if (item) {
                  unequip(slot)
                } else {
                  setFilterSlot(slot)
                  setShowInventory(true)
                }
              }}
              className="flex flex-col items-center gap-0.5 p-1.5 rounded border cursor-pointer transition-colors hover:border-gold/50"
              style={{
                borderColor: item ? RARITY_CONFIG[item.rarity].color + '60' : undefined,
                backgroundColor: item ? RARITY_CONFIG[item.rarity].color + '10' : undefined,
              }}
            >
              <span className="text-lg">{item?.emoji ?? slotInfo.emoji}</span>
              <span
                className="font-pixel text-[6px] truncate w-full text-center"
                style={{ color: item ? RARITY_CONFIG[item.rarity].color : '#888' }}
              >
                {item?.name ?? slotInfo.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Stat summary */}
      {(gear.attack > 0 || gear.defense > 0 || gear.critChance > 0 || gear.goldFind > 0) && (
        <div className="flex gap-3 justify-center mb-2">
          {gear.attack > 0 && <span className="font-pixel text-[7px] text-rpg-accent">+{gear.attack} ATK</span>}
          {gear.defense > 0 && <span className="font-pixel text-[7px] text-blue-400">+{gear.defense} DEF</span>}
          {gear.critChance > 0 && <span className="font-pixel text-[7px] text-yellow-400">+{(gear.critChance * 100).toFixed(1)}% KRIT</span>}
          {gear.goldFind > 0 && <span className="font-pixel text-[7px] text-green-400">+{(gear.goldFind * 100).toFixed(0)}% 🪙</span>}
        </div>
      )}

      {/* Inventory dropdown */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Slot filter tabs */}
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => setFilterSlot(null)}
                className={`font-pixel text-[7px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  !filterSlot ? 'text-gold bg-gold/20' : 'text-rpg-muted hover:text-rpg-text'
                }`}
              >
                Alle
              </button>
              {SLOTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSlot(s)}
                  className={`font-pixel text-[7px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    filterSlot === s ? 'text-gold bg-gold/20' : 'text-rpg-muted hover:text-rpg-text'
                  }`}
                >
                  {SLOT_LABELS[s].emoji}
                </button>
              ))}
            </div>

            {filteredInventory.length === 0 ? (
              <div className="font-pixel text-[7px] text-rpg-muted text-center py-2">
                Noch keine Gegenstände. Besiege Monster!
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {filteredInventory.map((item) => (
                  <InventoryRow key={item.id} item={item} onEquip={equip} equipped={equipped} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InventoryRow({
  item,
  onEquip,
  equipped,
}: {
  item: GearItem
  onEquip: (item: GearItem) => void
  equipped: Partial<Record<EquipSlot, GearItem>>
}) {
  const isEquipped = equipped[item.slot]?.id === item.id
  const rarityConfig = RARITY_CONFIG[item.rarity]

  return (
    <button
      onClick={() => !isEquipped && onEquip(item)}
      className={`flex items-center gap-2 px-2 py-1 rounded border text-left cursor-pointer transition-colors ${
        isEquipped ? 'border-gold/50 bg-gold/10' : 'border-rpg-border hover:border-rpg-muted'
      }`}
    >
      <span className="text-base">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div
          className="font-pixel text-[7px] truncate"
          style={{ color: rarityConfig.color }}
        >
          {item.name}
          {isEquipped && <span className="text-gold ml-1">[E]</span>}
        </div>
        <div className="font-pixel text-[6px] text-rpg-muted flex gap-2">
          {item.attack > 0 && <span>+{item.attack} ATK</span>}
          {item.defense > 0 && <span>+{item.defense} DEF</span>}
          {item.critChance > 0 && <span>+{(item.critChance * 100).toFixed(1)}%K</span>}
          {item.goldFind > 0 && <span>+{(item.goldFind * 100).toFixed(0)}%🪙</span>}
        </div>
      </div>
      <span className="font-pixel text-[6px]" style={{ color: rarityConfig.color }}>
        {rarityConfig.label}
      </span>
    </button>
  )
}
