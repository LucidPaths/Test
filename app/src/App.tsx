import { useState, useEffect } from 'react'
import { GameView } from './features/game/GameView'
import { EducationView } from './features/education/EducationView'
import { PortfolioView } from './features/portfolio/PortfolioView'
import { OnboardingView } from './features/onboarding/OnboardingView'
import { CurrencyDisplay } from './components/CurrencyDisplay'
import { useSavingsStore } from './stores/savingsStore'
import { useCharacterStore } from './stores/characterStore'
import { useGameStore } from './stores/gameStore'

type Tab = 'game' | 'learn' | 'portfolio'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'game', label: 'Kampf', icon: '⚔️' },
  { id: 'learn', label: 'Lernen', icon: '📚' },
  { id: 'portfolio', label: 'Portfolio', icon: '📊' },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('game')
  const started = useSavingsStore((s) => s.started)
  const balance = useSavingsStore((s) => s.balance)
  const products = useSavingsStore((s) => s.products)
  const age = useSavingsStore((s) => s.age)
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const resetGame = useSavingsStore((s) => s.resetGame)
  const level = useCharacterStore((s) => s.level)
  const recalculate = useCharacterStore((s) => s.recalculate)
  const spawnEnemy = useGameStore((s) => s.spawnEnemy)

  const currentSimAge = age + Math.floor(simulatedMonths / 12)

  // Initialize character from persisted savings on mount
  useEffect(() => {
    recalculate(balance, products)
    spawnEnemy(level || 1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Show onboarding if the user hasn't started yet
  if (!started) {
    return (
      <div className="flex flex-col h-full max-w-md mx-auto w-full">
        <OnboardingView />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full relative">
      {/* Top bar — fixed at top */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-3 py-2 bg-rpg-panel border-b border-rpg-border shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base">⚔️</span>
          <span className="font-pixel text-[8px] text-rpg-text">100K</span>
        </div>
        <CurrencyDisplay amount={balance} size="sm" />
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[7px] text-rpg-muted">Alter {currentSimAge}</span>
          <span className="font-pixel text-[8px] text-gold">Lv.{level}</span>
          <button
            onClick={() => { resetGame(); recalculate(0, []) }}
            className="font-pixel text-[7px] text-rpg-accent border border-rpg-accent/30 rounded px-1.5 py-0.5 cursor-pointer hover:bg-rpg-accent/20 transition-colors"
          >
            RESET
          </button>
        </div>
      </header>

      {/* Content — scrollable, with bottom padding for fixed nav */}
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'game' && <GameView />}
        {activeTab === 'learn' && <EducationView />}
        {activeTab === 'portfolio' && <PortfolioView />}
      </main>

      {/* Bottom nav — fixed at bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 max-w-md mx-auto flex bg-rpg-panel border-t border-rpg-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'text-gold bg-rpg-bg'
                : 'text-rpg-muted hover:text-rpg-text'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-pixel text-[7px]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
