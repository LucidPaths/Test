import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSavingsStore, BASELINE_RATE } from '../../stores/savingsStore'
import type { Gender } from '../../stores/savingsStore'
import { monthsToTarget } from '../../engine/compound'

const CONTRIBUTION_PRESETS = [25, 50, 100, 200]

const CHARACTER_OPTIONS: { gender: Gender; name: string; emoji: string; description: string }[] = [
  { gender: 'male', name: 'Sparritter', emoji: '🧙', description: 'Stärke und Disziplin — der Weg des Kriegers.' },
  { gender: 'female', name: 'Sparmagierin', emoji: '🧙‍♀️', description: 'Weisheit und Magie — der Weg der Magierin.' },
]

export function OnboardingView() {
  const age = useSavingsStore((s) => s.age)
  const gender = useSavingsStore((s) => s.gender)
  const setAge = useSavingsStore((s) => s.setAge)
  const setGender = useSavingsStore((s) => s.setGender)
  const monthlyContribution = useSavingsStore((s) => s.monthlyContribution)
  const setMonthlyContribution = useSavingsStore((s) => s.setMonthlyContribution)
  const startGame = useSavingsStore((s) => s.startGame)

  const [step, setStep] = useState(0)

  const monthsTo100K = monthsToTarget(0, monthlyContribution, BASELINE_RATE, 100_000)
  const yearsTo100K = Math.ceil(monthsTo100K / 12)

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center gap-6">
      {step === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 max-w-sm"
        >
          <div className="text-5xl">🧙</div>
          <h1 className="font-pixel text-sm text-gold leading-relaxed">
            100.000€ Quest
          </h1>
          <p className="text-sm text-rpg-text leading-relaxed">
            Die meisten Menschen sparen planlos — und geben auf.
          </p>
          <p className="text-sm text-rpg-muted leading-relaxed">
            Dieses Spiel zeigt dir, wie <span className="text-gold">Zinseszins</span> dein
            Geld für dich arbeiten lässt. Jeden Monat sparst du einen festen Betrag,
            dein Charakter wird stärker und du siehst live, wie dein Vermögen wächst.
          </p>
          <div className="bg-rpg-panel border border-rpg-border rounded-lg p-4 w-full">
            <p className="font-pixel text-[8px] text-rpg-muted mb-2">Was du lernst:</p>
            <ul className="text-left text-xs text-rpg-text space-y-2">
              <li>⚔️ Warum früh anfangen den größten Unterschied macht</li>
              <li>📈 Wie Zinseszins exponentiell wächst</li>
              <li>🛡️ Welche Sparprodukte es bei deiner VR-Bank gibt</li>
              <li>🎯 Dass 100K realistisch ist — auch mit kleinen Beträgen</li>
            </ul>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(1)}
            className="w-full py-3 bg-gold/20 border border-gold/50 rounded-lg font-pixel text-[10px] text-gold cursor-pointer hover:bg-gold/30 transition-colors"
          >
            Quest starten →
          </motion.button>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 max-w-sm w-full"
        >
          <h2 className="font-pixel text-[10px] text-gold">Wähle deinen Charakter</h2>
          <p className="text-xs text-rpg-muted">
            Dein Gefährte wartet im ersten Dungeon auf dich.
          </p>

          <div className="flex gap-3 w-full">
            {CHARACTER_OPTIONS.map((opt) => (
              <button
                key={opt.gender}
                onClick={() => setGender(opt.gender)}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-all cursor-pointer ${
                  gender === opt.gender
                    ? 'bg-gold/20 border-gold'
                    : 'bg-rpg-panel border-rpg-border hover:border-gold/40'
                }`}
              >
                <span className="text-4xl">{opt.emoji}</span>
                <span className="font-pixel text-[8px] text-rpg-text">{opt.name}</span>
                <span className="font-pixel text-[5px] text-rpg-muted leading-relaxed">{opt.description}</span>
              </button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(2)}
            className="w-full py-3 bg-gold/20 border border-gold/50 rounded-lg font-pixel text-[10px] text-gold cursor-pointer hover:bg-gold/30 transition-colors"
          >
            Weiter →
          </motion.button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 max-w-sm w-full"
        >
          <div className="text-4xl">🎂</div>
          <h2 className="font-pixel text-[10px] text-gold">Wie alt bist du?</h2>
          <p className="text-xs text-rpg-muted">
            Je jünger du startest, desto mehr arbeitet die Zeit für dich.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setAge(age - 1)}
              className="w-10 h-10 rounded-lg bg-rpg-panel border border-rpg-border font-pixel text-lg text-rpg-text cursor-pointer hover:border-gold/50"
            >
              −
            </button>
            <span className="font-pixel text-xl text-gold w-16 text-center">{age}</span>
            <button
              onClick={() => setAge(age + 1)}
              className="w-10 h-10 rounded-lg bg-rpg-panel border border-rpg-border font-pixel text-lg text-rpg-text cursor-pointer hover:border-gold/50"
            >
              +
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(3)}
            className="w-full py-3 bg-gold/20 border border-gold/50 rounded-lg font-pixel text-[10px] text-gold cursor-pointer hover:bg-gold/30 transition-colors"
          >
            Weiter →
          </motion.button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 max-w-sm w-full"
        >
          <div className="text-4xl">💰</div>
          <h2 className="font-pixel text-[10px] text-gold">Monatlich sparen</h2>
          <p className="text-xs text-rpg-muted">
            Wie viel kannst du pro Monat zur Seite legen?
          </p>

          <div className="grid grid-cols-2 gap-2 w-full">
            {CONTRIBUTION_PRESETS.map((amount) => (
              <button
                key={amount}
                onClick={() => setMonthlyContribution(amount)}
                className={`py-3 rounded-lg border font-pixel text-[10px] cursor-pointer transition-colors ${
                  monthlyContribution === amount
                    ? 'bg-gold/20 border-gold text-gold'
                    : 'bg-rpg-panel border-rpg-border text-rpg-muted hover:border-gold/50'
                }`}
              >
                €{amount}/Monat
              </button>
            ))}
          </div>

          <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3 w-full">
            <p className="font-pixel text-[8px] text-rpg-muted">
              Mit €{monthlyContribution}/Monat erreichst du 100K in ca. <span className="text-gold">{yearsTo100K} Jahren</span> —
              mit Zinsen sogar schneller!
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="w-full py-3 bg-gold/30 border border-gold rounded-lg font-pixel text-[10px] text-gold cursor-pointer hover:bg-gold/40 transition-colors animate-pulse-glow"
          >
            ⚔️ Abenteuer beginnen!
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
