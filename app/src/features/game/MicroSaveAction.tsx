import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSavingsStore } from '../../stores/savingsStore'
import { useCharacterStore } from '../../stores/characterStore'

interface SaveAction {
  label: string
  amount: number
  icon: string
  color: string
}

const ACTIONS: SaveAction[] = [
  { label: 'Schwert schärfen', amount: 0.5, icon: '⚔️', color: 'border-blue-400' },
  { label: 'Heiltrank kaufen', amount: 1.0, icon: '🧪', color: 'border-green-400' },
  { label: 'Rüstung schmieden', amount: 2.0, icon: '🛡️', color: 'border-yellow-400' },
  { label: 'Waffe verzaubern', amount: 5.0, icon: '✨', color: 'border-purple-400' },
]

export function MicroSaveAction() {
  const microSave = useSavingsStore((s) => s.microSave)
  const products = useSavingsStore((s) => s.products)
  const balance = useSavingsStore((s) => s.balance)
  const recalculate = useCharacterStore((s) => s.recalculate)
  const [popups, setPopups] = useState<{ id: string; amount: number; x: number }[]>([])

  function handleSave(action: SaveAction, idx: number) {
    microSave(action.amount, action.label, action.icon)
    // Recalculate character with new balance
    const newBalance = balance + action.amount
    recalculate(newBalance, products)

    // Show popup
    const id = `pop-${Date.now()}-${idx}`
    setPopups((p) => [...p, { id, amount: action.amount, x: idx * 25 }])
    setTimeout(() => setPopups((p) => p.filter((pp) => pp.id !== id)), 1000)
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleSave(action, i)}
            className={`flex items-center gap-2 px-3 py-2.5 bg-rpg-panel border-2 ${action.color} rounded-lg
              active:brightness-125 transition-all cursor-pointer select-none`}
          >
            <span className="text-xl">{action.icon}</span>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-pixel leading-tight">{action.label}</span>
              <span className="text-[8px] font-pixel text-gold">
                €{action.amount.toFixed(2)}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

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
