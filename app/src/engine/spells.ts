import type { Spell, ActiveSpellBuff, ActiveDoT } from '../types/spell'

/**
 * Check if a spell is ready to cast (off cooldown).
 */
export function isSpellReady(spellId: string, cooldowns: Record<string, number>): boolean {
  const cd = cooldowns[spellId]
  if (!cd) return true
  return Date.now() >= cd
}

/**
 * Get remaining cooldown in ms (0 if ready).
 */
export function getSpellCooldownRemaining(spellId: string, cooldowns: Record<string, number>): number {
  const cd = cooldowns[spellId]
  if (!cd) return 0
  return Math.max(0, cd - Date.now())
}

/**
 * Apply a spell's effect. Returns:
 * - damage: instant damage to deal
 * - buff: a temporary buff to add (if applicable)
 * - dot: a damage-over-time effect to add (if applicable)
 * - executed: whether the enemy was instantly killed via execute
 */
export function applySpellEffect(
  spell: Spell,
  currentDPS: number,
  enemyHp: number,
  enemyMaxHp: number,
): {
  damage: number
  buff: ActiveSpellBuff | null
  dot: ActiveDoT | null
  executed: boolean
} {
  const result = { damage: 0, buff: null as ActiveSpellBuff | null, dot: null as ActiveDoT | null, executed: false }

  switch (spell.effect.type) {
    case 'damage':
      result.damage = Math.floor(currentDPS * spell.effect.multiplier)
      break

    case 'dot':
      result.dot = {
        spellId: spell.id,
        tickMultiplier: spell.effect.tickMultiplier,
        ticksRemaining: spell.effect.ticks,
      }
      break

    case 'buff':
      result.buff = {
        spellId: spell.id,
        stat: spell.effect.stat,
        value: spell.effect.value,
        expiresAt: Date.now() + spell.effect.durationMs,
      }
      break

    case 'execute':
      if (enemyHp / enemyMaxHp <= spell.effect.hpThreshold) {
        result.executed = true
        result.damage = enemyHp // kill instantly
      }
      break
  }

  return result
}
