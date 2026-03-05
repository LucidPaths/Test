import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { TAVERN_FACTS } from '../../data/tavernFacts'

const FACT_COST = 5

export function Taverne({ onBack }: { onBack: () => void }) {
  const combatTokens = useGameStore((s) => s.combatTokens)
  const spendTokens = useGameStore((s) => s.spendTokens)
  const [currentFact, setCurrentFact] = useState<typeof TAVERN_FACTS[number] | null>(null)
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const [factKey, setFactKey] = useState(0)

  const canAfford = combatTokens >= FACT_COST

  const handleDrink = () => {
    if (!spendTokens(FACT_COST)) return

    // Pick a random unseen fact, or any random if all seen
    const unseen = TAVERN_FACTS.filter((f) => !seenIds.has(f.id))
    const pool = unseen.length > 0 ? unseen : TAVERN_FACTS
    const fact = pool[Math.floor(Math.random() * pool.length)]

    setSeenIds((prev) => new Set(prev).add(fact.id))
    setCurrentFact(fact)
    setFactKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="font-pixel text-[8px] text-rpg-muted cursor-pointer hover:text-rpg-text transition-colors"
        >
          ← Zurück
        </button>
        <span className="font-pixel text-[10px] text-gold">🍺 Taverne</span>
      </div>

      {/* Tavern interior card */}
      <div className="bg-rpg-panel border border-rpg-border rounded-lg p-4">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🍺</div>
          <p className="font-pixel text-[8px] text-rpg-muted">
            Der Wirt kennt viele Geschichten über Geld und Finanzen.
          </p>
          <p className="font-pixel text-[7px] text-rpg-muted mt-1">
            Bestelle ein Getränk und lerne etwas Neues!
          </p>
        </div>

        {/* Buy a drink button */}
        <button
          onClick={handleDrink}
          disabled={!canAfford}
          className={`w-full py-2.5 rounded-lg border font-pixel text-[9px] transition-colors ${
            canAfford
              ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 cursor-pointer hover:bg-amber-500/20'
              : 'border-rpg-border text-rpg-muted cursor-not-allowed opacity-50'
          }`}
        >
          🍻 Getränk bestellen — {FACT_COST} 🪙
        </button>

        {/* Fact display */}
        <AnimatePresence mode="wait">
          {currentFact && (
            <motion.div
              key={factKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-rpg-bg border border-rpg-border rounded-lg p-3"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{currentFact.topicEmoji}</span>
                <span className="font-pixel text-[7px] text-gold">{currentFact.topic}</span>
              </div>
              <p className="text-[11px] text-rpg-text leading-relaxed">
                {currentFact.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <div className="mt-3 text-center">
          <span className="font-pixel text-[7px] text-rpg-muted">
            {seenIds.size}/{TAVERN_FACTS.length} Fakten entdeckt
          </span>
        </div>
      </div>
    </div>
  )
}
