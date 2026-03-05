import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSavingsStore } from '../../stores/savingsStore'
import { useCharacterStore } from '../../stores/characterStore'

interface SaveAction {
  label: string
  amount: number
  icon: string
  color: string
  effect: string
}

const ACTIONS: SaveAction[] = [
  { label: 'Schwert schärfen', amount: 0.5, icon: '⚔️', color: 'border-blue-400/50', effect: '+ATK Boost' },
  { label: 'Heiltrank kaufen', amount: 1.0, icon: '🧪', color: 'border-green-400/50', effect: '+HP Boost' },
  { label: 'Rüstung schmieden', amount: 2.0, icon: '🛡️', color: 'border-yellow-400/50', effect: '+DEF Boost' },
  { label: 'Waffe verzaubern', amount: 5.0, icon: '✨', color: 'border-purple-400/50', effect: '+CRIT Boost' },
]

export function MicroSaveAction() {
  const microSave = useSavingsStore((s) => s.microSave)
  const recalculate = useCharacterStore((s) => s.recalculate)
  const [popups, setPopups] = useState<{ id: string; amount: number; x: number }[]>([])
  const [collapsed, setCollapsed] = useState(true)

  function handleSave(action: SaveAction, idx: number) {
    microSave(action.amount, action.label, action.icon)
    // Read fresh state after microSave to avoid race with simulation tick
    const { balance: freshBalance, products: freshProducts } = useSavingsStore.getState()
    recalculate(freshBalance, freshProducts)

    const id = `pop-${Date.now()}-${idx}`
    setPopups((p) => [...p, { id, amount: action.amount, x: idx * 25 }])
    setTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== id)), 1000)
  }

  return (
    <div className="relative">
      {/* Collapsible header — clearly optional */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2 bg-rpg-panel border border-rpg-border rounded-lg cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🚀</span>
          <span className="font-pixel text-[9px] text-rpg-muted">
            Turbo-Boost (optional)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[7px] text-rpg-muted">
            Mikro-Sparen beschleunigt dein Ziel
          </span>
          <span className="text-rpg-muted text-xs">{collapsed ? '▼' : '▲'}</span>
        </div>
      </button>

      {!collapsed && (
        <div className="mt-2">
          <p className="font-pixel text-[7px] text-rpg-muted mb-2 px-1">
            Kleine Beträge von deinem Konto auf dein Sparkonto. Jeder Cent beschleunigt dein 100K-Ziel!
          </p>

          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map((action, i) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSave(action, i)}
                className={`flex items-center gap-2 px-3 py-2 bg-rpg-panel border ${action.color} rounded-lg
                  active:brightness-125 transition-all cursor-pointer select-none`}
              >
                <span className="text-lg">{action.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-pixel leading-tight">{action.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-pixel text-gold">
                      €{action.amount.toFixed(2)}
                    </span>
                    <span className="text-[6px] font-pixel text-xp-green">
                      {action.effect}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {popups.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 font-pixel text-xp-green text-sm pointer-events-none"
            style={{ left: `${20 + p.x}%` }}
          >
            +€{p.amount.toFixed(2)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
