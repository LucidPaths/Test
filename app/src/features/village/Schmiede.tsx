import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEquipmentStore } from '../../stores/equipmentStore'
import { useGameStore } from '../../stores/gameStore'
import type { GearItem, Rarity } from '../../types/equipment'
import { RARITY_CONFIG, SLOT_LABELS } from '../../types/equipment'

const UPGRADE_TABLE: Record<Rarity, { cost: number; successRate: number; nextRarity: Rarity | null }> = {
  common:    { cost: 15,  successRate: 0.80, nextRarity: 'uncommon' },
  uncommon:  { cost: 40,  successRate: 0.60, nextRarity: 'rare' },
  rare:      { cost: 100, successRate: 0.35, nextRarity: 'epic' },
  epic:      { cost: 250, successRate: 0.15, nextRarity: 'legendary' },
  legendary: { cost: 0,   successRate: 0,    nextRarity: null },
}

const STAT_BOOST_ON_UPGRADE = 2.2

export function Schmiede({ onBack }: { onBack: () => void }) {
  const inventory = useEquipmentStore((s) => s.inventory)
  const equipped = useEquipmentStore((s) => s.equipped)
  const upgradeItem = useEquipmentStore((s) => s.upgradeItem)
  const combatTokens = useGameStore((s) => s.combatTokens)
  const spendTokens = useGameStore((s) => s.spendTokens)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [result, setResult] = useState<{ type: 'success' | 'fail'; itemName: string; rarity: Rarity } | null>(null)
  const [resultKey, setResultKey] = useState(0)

  // All gear: equipped + inventory (deduplicated)
  const allGear = [
    ...Object.values(equipped).filter((g): g is GearItem => !!g),
    ...inventory.filter((i) => !Object.values(equipped).some((e) => e?.id === i.id)),
  ]

  const selectedItem = allGear.find((i) => i.id === selectedId) ?? null
  const upgradeInfo = selectedItem ? UPGRADE_TABLE[selectedItem.rarity] : null
  const canUpgrade = selectedItem && upgradeInfo?.nextRarity && combatTokens >= (upgradeInfo?.cost ?? Infinity)

  const handleUpgrade = () => {
    if (!selectedItem || !upgradeInfo?.nextRarity) return
    if (!spendTokens(upgradeInfo.cost)) return

    const success = Math.random() < upgradeInfo.successRate

    if (success) {
      upgradeItem(selectedItem.id, upgradeInfo.nextRarity, STAT_BOOST_ON_UPGRADE)
      setResult({ type: 'success', itemName: selectedItem.name, rarity: upgradeInfo.nextRarity })
    } else {
      setResult({ type: 'fail', itemName: selectedItem.name, rarity: selectedItem.rarity })
    }

    setResultKey((k) => k + 1)
    setTimeout(() => setResult(null), 2500)
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="font-pixel text-[8px] text-rpg-muted cursor-pointer hover:text-rpg-text transition-colors"
        >
          ← Zurück
        </button>
        <span className="font-pixel text-[10px] text-gold">⚒️ Schmiede</span>
      </div>

      <div className="bg-rpg-panel border border-rpg-border rounded-lg p-4">
        <div className="text-center mb-3">
          <div className="text-4xl mb-2">⚒️</div>
          <p className="font-pixel text-[8px] text-rpg-muted">
            Verbessere deine Ausrüstung — aber Vorsicht, es kann schiefgehen!
          </p>
        </div>

        {/* Item selection */}
        {allGear.length === 0 ? (
          <div className="text-center py-4">
            <span className="font-pixel text-[8px] text-rpg-muted">
              Keine Ausrüstung vorhanden. Besiege Monster!
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 mb-3">
            {allGear.map((item) => {
              const isSelected = selectedId === item.id
              const info = UPGRADE_TABLE[item.rarity]
              const isMaxed = !info.nextRarity
              return (
                <button
                  key={item.id}
                  onClick={() => !isMaxed && setSelectedId(isSelected ? null : item.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded border text-left transition-colors ${
                    isMaxed
                      ? 'border-rpg-border opacity-40 cursor-not-allowed'
                      : isSelected
                        ? 'border-gold/60 bg-gold/10 cursor-pointer'
                        : 'border-rpg-border cursor-pointer hover:border-rpg-muted'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-pixel text-[7px] truncate" style={{ color: RARITY_CONFIG[item.rarity].color }}>
                      {item.name}
                      <span className="text-rpg-muted ml-1">{SLOT_LABELS[item.slot].emoji}</span>
                    </div>
                    <div className="font-pixel text-[6px] text-rpg-muted flex gap-2">
                      {item.attack > 0 && <span>⚔️ {item.attack}</span>}
                      {item.defense > 0 && <span>🛡️ {item.defense}</span>}
                      {item.critChance > 0 && <span>💥 {(item.critChance * 100).toFixed(1)}%</span>}
                      {item.goldFind > 0 && <span>🪙 +{(item.goldFind * 100).toFixed(0)}%</span>}
                    </div>
                  </div>
                  <span className="font-pixel text-[6px]" style={{ color: RARITY_CONFIG[item.rarity].color }}>
                    {isMaxed ? 'MAX' : RARITY_CONFIG[item.rarity].label}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Upgrade preview */}
        {selectedItem && upgradeInfo?.nextRarity && (
          <div className="bg-rpg-bg border border-rpg-border rounded-lg p-3 mb-3">
            <div className="flex items-center gap-1 mb-2">
              <span className="font-pixel text-[7px]" style={{ color: RARITY_CONFIG[selectedItem.rarity].color }}>
                {RARITY_CONFIG[selectedItem.rarity].label}
              </span>
              <span className="font-pixel text-[7px] text-rpg-muted">→</span>
              <span className="font-pixel text-[7px]" style={{ color: RARITY_CONFIG[upgradeInfo.nextRarity].color }}>
                {RARITY_CONFIG[upgradeInfo.nextRarity].label}
              </span>
            </div>

            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="font-pixel text-[7px] text-rpg-muted">Erfolg</span>
                <span className={`font-pixel text-[7px] ${
                  upgradeInfo.successRate >= 0.5 ? 'text-xp-green' : upgradeInfo.successRate >= 0.25 ? 'text-gold' : 'text-rpg-accent'
                }`}>
                  {Math.round(upgradeInfo.successRate * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-sm overflow-hidden border border-white/20" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div
                  className={`h-full transition-all duration-300 ${
                    upgradeInfo.successRate >= 0.5 ? 'bg-xp-green' : upgradeInfo.successRate >= 0.25 ? 'bg-gold' : 'bg-rpg-accent'
                  }`}
                  style={{ width: `${upgradeInfo.successRate * 100}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-pixel text-[7px] text-rpg-muted">Kosten: {upgradeInfo.cost} 🪙</span>
              <span className="font-pixel text-[7px] text-rpg-muted">Stats: ×{STAT_BOOST_ON_UPGRADE}</span>
            </div>
          </div>
        )}

        {/* Upgrade button */}
        {selectedItem && (
          <button
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            className={`w-full py-2.5 rounded-lg border font-pixel text-[9px] transition-colors ${
              canUpgrade
                ? 'border-gold/50 text-gold bg-gold/10 cursor-pointer hover:bg-gold/20'
                : 'border-rpg-border text-rpg-muted cursor-not-allowed opacity-50'
            }`}
          >
            ⚒️ Schmieden — {upgradeInfo?.cost ?? 0} 🪙
          </button>
        )}

        {/* Result feedback */}
        <AnimatePresence>
          {result && (
            <motion.div
              key={resultKey}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className={`mt-3 py-3 rounded-lg border text-center ${
                result.type === 'success'
                  ? 'border-xp-green/50 bg-xp-green/10'
                  : 'border-rpg-accent/50 bg-rpg-accent/10'
              }`}
            >
              <span className="text-2xl">{result.type === 'success' ? '✨' : '💔'}</span>
              <div className={`font-pixel text-[9px] mt-1 ${
                result.type === 'success' ? 'text-xp-green' : 'text-rpg-accent'
              }`}>
                {result.type === 'success' ? 'Verbesserung gelungen!' : 'Fehlgeschlagen...'}
              </div>
              {result.type === 'success' && (
                <div className="font-pixel text-[7px] text-rpg-muted mt-1">
                  {result.itemName} ist jetzt{' '}
                  <span style={{ color: RARITY_CONFIG[result.rarity].color }}>
                    {RARITY_CONFIG[result.rarity].label}
                  </span>!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
