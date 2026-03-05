import { useGameStore } from '../../stores/gameStore'
import { useSpellStore } from '../../stores/spellStore'
import { getSpellById, SPELLS } from '../../data/spells'
import { isSpellReady, getSpellCooldownRemaining, applySpellEffect } from '../../engine/spells'

interface SpellBarProps {
  dps: number
  enemyHp: number
  enemyMaxHp: number
}

export function SpellBar({ dps, enemyHp, enemyMaxHp }: SpellBarProps) {
  const equippedSpellIds = useSpellStore((s) => s.equippedSpellIds)
  const cooldowns = useSpellStore((s) => s.cooldowns)
  const autoCast = useSpellStore((s) => s.autoCast)
  const mana = useGameStore((s) => s.mana)

  if (equippedSpellIds.length === 0) return null

  const handleCast = (spellId: string) => {
    if (!isSpellReady(spellId, cooldowns)) return
    const spell = getSpellById(spellId)
    if (!spell) return
    if (!useGameStore.getState().spendMana(spell.manaCost)) return

    useSpellStore.getState().setCooldown(spellId, spell.cooldownMs)
    const result = applySpellEffect(spell, dps, enemyHp, enemyMaxHp)

    if (result.damage > 0) {
      useGameStore.getState().dealDamage(result.damage, false, 0, 1)
      useGameStore.getState().addDamageNumber(result.damage, false, true)
    }
    if (result.executed) {
      useGameStore.getState().dealDamage(enemyHp, false, 0, 1)
      useGameStore.getState().addDamageNumber(enemyHp, false, true)
    }
    if (result.buff) useGameStore.getState().addSpellBuff(result.buff)
    if (result.dot) useGameStore.getState().addDoT(result.dot)
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-pixel text-[6px] text-rpg-muted">Zauber</span>
        <button
          onClick={() => useSpellStore.getState().toggleAutoCast()}
          className={`font-pixel text-[6px] px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
            autoCast ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-rpg-muted border-rpg-border'
          }`}
        >
          {autoCast ? 'AUTO' : 'MANUELL'}
        </button>
      </div>
      <div className="flex gap-1.5 justify-center">
        {equippedSpellIds.map((spellId) => {
          const spell = getSpellById(spellId)
          if (!spell) return null
          const ready = isSpellReady(spellId, cooldowns)
          const cdRemaining = getSpellCooldownRemaining(spellId, cooldowns)
          const canAfford = mana >= spell.manaCost

          return (
            <button
              key={spellId}
              onClick={() => handleCast(spellId)}
              disabled={!ready || !canAfford}
              className={`relative flex flex-col items-center w-14 py-1.5 rounded-lg border transition-all cursor-pointer ${
                ready && canAfford
                  ? 'bg-rpg-panel border-blue-400/40 hover:border-blue-400 active:scale-95'
                  : 'bg-rpg-bg/50 border-rpg-border/50 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="text-lg">{spell.emoji}</span>
              <span className="font-pixel text-[5px] text-rpg-muted mt-0.5">{spell.name}</span>
              <span className="font-pixel text-[5px] text-blue-400">{spell.manaCost}MP</span>
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-rpg-bg/70 rounded-lg">
                  <span className="font-pixel text-[8px] text-rpg-muted">
                    {Math.ceil(cdRemaining / 1000)}s
                  </span>
                </div>
              )}
            </button>
          )
        })}

        {/* Empty slots */}
        {Array.from({ length: 3 - equippedSpellIds.length }).map((_, i) => (
          <div key={`empty-${i}`} className="w-14 py-1.5 rounded-lg border border-rpg-border/30 bg-rpg-bg/20 flex items-center justify-center">
            <span className="font-pixel text-[7px] text-rpg-muted">—</span>
          </div>
        ))}
      </div>
    </div>
  )
}
