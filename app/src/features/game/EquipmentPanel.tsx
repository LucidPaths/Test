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
      {/* Header row */}
      <div className="flex justify-between items-center mb-2.5">
        <span className="font-pixel text-[9px] text-rpg-text">Ausrüstung</span>
        {(gear.attack > 0 || gear.defense > 0 || gear.critChance > 0 || gear.goldFind > 0) && (
          <div className="flex gap-2">
            {gear.attack > 0 && <span className="font-pixel text-[6px] text-rpg-accent">+{gear.attack} ATK</span>}
            {gear.defense > 0 && <span className="font-pixel text-[6px] text-mana-blue">+{gear.defense} DEF</span>}
            {gear.critChance > 0 && <span className="font-pixel text-[6px] text-gold">+{(gear.critChance * 100).toFixed(1)}%K</span>}
            {gear.goldFind > 0 && <span className="font-pixel text-[6px] text-xp-green">+{(gear.goldFind * 100).toFixed(0)}%🪙</span>}
          </div>
        )}
      </div>

      {/* Equipped slots — 4 clean boxes */}
      <div className="grid grid-cols-4 gap-2 mb-2.5">
        {SLOTS.map((slot) => {
          const item = equipped[slot]
          const slotInfo = SLOT_LABELS[slot]
          const rarityColor = item ? RARITY_CONFIG[item.rarity].color : '#333'
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
              className="relative flex flex-col items-center justify-center gap-1 aspect-square rounded-lg border-2 cursor-pointer transition-all hover:brightness-110"
              style={{
                borderColor: item ? rarityColor + '80' : '#0f346040',
                background: item
                  ? `linear-gradient(135deg, ${rarityColor}08, ${rarityColor}18)`
                  : 'rgba(15,52,96,0.2)',
              }}
            >
              <span className="text-xl">{item?.emoji ?? slotInfo.emoji}</span>
              <span
                className="font-pixel text-[5px] truncate w-full text-center px-0.5"
                style={{ color: item ? rarityColor : '#666' }}
              >
                {item?.name ?? slotInfo.label}
              </span>
              {/* Rarity dot indicator */}
              {item && (
                <div
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: rarityColor }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Inventory toggle */}
      <button
        onClick={() => setShowInventory(!showInventory)}
        className="w-full font-pixel text-[7px] text-rpg-muted py-1 cursor-pointer hover:text-gold transition-colors"
      >
        {showInventory ? '▲ Inventar schließen' : `▼ Inventar öffnen (${inventory.length}/50)`}
      </button>

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
            <div className="flex gap-1 mt-2 mb-2">
              <FilterTab active={!filterSlot} onClick={() => setFilterSlot(null)} label="Alle" />
              {SLOTS.map((s) => (
                <FilterTab
                  key={s}
                  active={filterSlot === s}
                  onClick={() => setFilterSlot(s)}
                  label={SLOT_LABELS[s].emoji}
                />
              ))}
            </div>

            {filteredInventory.length === 0 ? (
              <div className="font-pixel text-[7px] text-rpg-muted text-center py-3">
                {filterSlot ? 'Keine Gegenstände in diesem Slot.' : 'Noch keine Gegenstände. Besiege Monster!'}
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-44 overflow-y-auto">
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

function FilterTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`font-pixel text-[7px] px-2 py-1 rounded cursor-pointer transition-colors ${
        active ? 'text-gold bg-gold/15 border border-gold/30' : 'text-rpg-muted hover:text-rpg-text border border-transparent'
      }`}
    >
      {label}
    </button>
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
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all ${
        isEquipped
          ? 'border-gold/40 bg-gold/8 cursor-default'
          : 'border-rpg-border cursor-pointer hover:border-rpg-muted hover:bg-rpg-bg/50'
      }`}
    >
      <span className="text-lg">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-pixel text-[7px] truncate" style={{ color: rarityConfig.color }}>
          {item.name}
          {isEquipped && <span className="text-gold/70 ml-1">[E]</span>}
        </div>
        <div className="font-pixel text-[5px] text-rpg-muted flex gap-2 mt-0.5">
          {item.attack > 0 && <span>⚔️ {item.attack}</span>}
          {item.defense > 0 && <span>🛡️ {item.defense}</span>}
          {item.critChance > 0 && <span>💥 {(item.critChance * 100).toFixed(1)}%</span>}
          {item.goldFind > 0 && <span>🪙 +{(item.goldFind * 100).toFixed(0)}%</span>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: rarityConfig.color }}
        />
        <span className="font-pixel text-[5px]" style={{ color: rarityConfig.color }}>
          {rarityConfig.label}
        </span>
      </div>
    </button>
  )
}
