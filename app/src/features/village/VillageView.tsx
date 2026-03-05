import { useState } from 'react'
import { motion } from 'framer-motion'
import { Taverne } from './Taverne'
import { Schmiede } from './Schmiede'
import { Akademie } from './Akademie'
import { Kaserne } from './Kaserne'

type Building = 'taverne' | 'schmiede' | 'akademie' | 'kaserne' | null

interface BuildingDef {
  id: Building & string
  name: string
  emoji: string
  description: string
  unlocked: boolean
}

const BUILDINGS: BuildingDef[] = [
  { id: 'taverne', name: 'Taverne', emoji: '🍺', description: 'Finanzwissen vom Wirt', unlocked: true },
  { id: 'schmiede', name: 'Schmiede', emoji: '⚒️', description: 'Ausrüstung verbessern', unlocked: true },
  { id: 'akademie', name: 'Akademie', emoji: '📚', description: 'Video-Lektionen', unlocked: true },
  { id: 'kaserne', name: 'Kaserne', emoji: '🏰', description: 'Söldner rekrutieren', unlocked: true },
]

export function VillageView() {
  const [activeBuilding, setActiveBuilding] = useState<Building>(null)

  if (activeBuilding === 'taverne') return <Taverne onBack={() => setActiveBuilding(null)} />
  if (activeBuilding === 'schmiede') return <Schmiede onBack={() => setActiveBuilding(null)} />
  if (activeBuilding === 'akademie') return <Akademie onBack={() => setActiveBuilding(null)} />
  if (activeBuilding === 'kaserne') return <Kaserne onBack={() => setActiveBuilding(null)} />

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Village header */}
      <div className="text-center py-2">
        <div className="text-3xl mb-1">🏘️</div>
        <h2 className="font-pixel text-[11px] text-gold">Dorf</h2>
        <p className="font-pixel text-[7px] text-rpg-muted mt-1">
          Gib deine Tokens aus und werde stärker
        </p>
      </div>

      {/* Building grid */}
      <div className="grid grid-cols-2 gap-2">
        {BUILDINGS.map((b, i) => (
          <motion.button
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => b.unlocked && setActiveBuilding(b.id)}
            className={`flex flex-col items-center gap-1.5 p-4 rounded-lg border transition-all ${
              b.unlocked
                ? 'bg-rpg-panel border-rpg-border cursor-pointer hover:border-gold/40 hover:bg-rpg-bg active:scale-[0.97]'
                : 'bg-rpg-panel/50 border-rpg-border/50 cursor-not-allowed opacity-40'
            }`}
          >
            <span className="text-3xl">{b.emoji}</span>
            <span className="font-pixel text-[8px] text-rpg-text">{b.name}</span>
            <span className="font-pixel text-[6px] text-rpg-muted text-center leading-relaxed">
              {b.unlocked ? b.description : '🔒 Bald verfügbar'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
