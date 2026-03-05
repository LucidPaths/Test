import type { Pet, PetState, PetEvolution } from '../types/pet'

/**
 * Get the current evolution stage of a pet.
 * Returns the highest evolution the pet has reached, or null if base form.
 */
export function getPetEvolution(pet: Pet, petState: PetState): PetEvolution | null {
  let current: PetEvolution | null = null
  for (const evo of pet.evolution) {
    if (petState.level >= evo.level) current = evo
  }
  return current
}

/**
 * Get the effective bonus value for an equipped pet, accounting for evolution.
 */
export function getPetBonusValue(pet: Pet, petState: PetState): number {
  const evo = getPetEvolution(pet, petState)
  return evo ? pet.passiveBonus.value * evo.bonusMultiplier : pet.passiveBonus.value
}

/**
 * XP required for next pet level.
 */
export function getPetXPToNext(level: number): number {
  return level * 20
}

/**
 * Get pet display name (accounting for evolution).
 */
export function getPetDisplayName(pet: Pet, petState: PetState): string {
  const evo = getPetEvolution(pet, petState)
  return evo ? evo.name : pet.name
}

/**
 * Get pet display emoji (accounting for evolution).
 */
export function getPetDisplayEmoji(pet: Pet, petState: PetState): string {
  const evo = getPetEvolution(pet, petState)
  return evo ? evo.emoji : pet.emoji
}
