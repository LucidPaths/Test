import { usePetStore } from '../../stores/petStore'
import { useEquipmentStore } from '../../stores/equipmentStore'
import { PETS, getPetById } from '../../data/pets'
import { getPetDisplayName, getPetDisplayEmoji, getPetBonusValue, getPetXPToNext } from '../../engine/pets'
import { isZoneUnlocked } from '../../engine/zones'
import { useSavingsStore } from '../../stores/savingsStore'
import { useState } from 'react'

export function PetPanel() {
  const [showCollection, setShowCollection] = useState(false)
  const equippedPetId = usePetStore((s) => s.equippedPetId)
  const unlockedPetIds = usePetStore((s) => s.unlockedPetIds)
  const petStates = usePetStore((s) => s.petStates)
  const zoneProgress = useEquipmentStore((s) => s.zoneProgress)
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)

  const equippedPet = equippedPetId ? getPetById(equippedPetId) : null
  const equippedState = equippedPetId ? petStates[equippedPetId] : null

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-pixel text-[8px] text-rpg-text">🐾 Begleiter</span>
        <button
          onClick={() => setShowCollection(!showCollection)}
          className="font-pixel text-[6px] text-rpg-muted border border-rpg-border rounded px-1.5 py-0.5 cursor-pointer hover:text-gold transition-colors"
        >
          {showCollection ? 'Schließen' : `Sammlung (${unlockedPetIds.length}/${PETS.length})`}
        </button>
      </div>

      {/* Equipped pet */}
      {equippedPet && equippedState ? (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{getPetDisplayEmoji(equippedPet, equippedState)}</span>
          <div className="flex-1">
            <div className="font-pixel text-[7px] text-rpg-text">
              {getPetDisplayName(equippedPet, equippedState)} Lv.{equippedState.level}
            </div>
            <div className="font-pixel text-[6px] text-green-400">
              +{equippedPet.passiveBonus.isMultiplier ? `${Math.round(getPetBonusValue(equippedPet, equippedState) * 100)}%` : getPetBonusValue(equippedPet, equippedState)} {equippedPet.passiveBonus.stat}
            </div>
            {/* XP bar */}
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex-1 bg-rpg-bg rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${(equippedState.xp / getPetXPToNext(equippedState.level)) * 100}%` }}
                />
              </div>
              <span className="font-pixel text-[5px] text-rpg-muted">
                {equippedState.xp}/{getPetXPToNext(equippedState.level)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="font-pixel text-[7px] text-rpg-muted text-center py-2">
          Kein Begleiter ausgerüstet
        </div>
      )}

      {/* Collection */}
      {showCollection && (
        <div className="flex flex-col gap-1.5 mt-2 border-t border-rpg-border pt-2">
          {PETS.map((pet) => {
            const unlocked = unlockedPetIds.includes(pet.id)
            const isEquipped = equippedPetId === pet.id
            const petState = petStates[pet.id]
            const zoneCleared = zoneProgress[pet.unlockZoneId]?.cleared

            return (
              <div key={pet.id} className={`flex items-center gap-2 p-1.5 rounded ${unlocked ? 'bg-rpg-bg/50' : 'opacity-40'}`}>
                <span className={`text-lg ${!unlocked ? 'grayscale' : ''}`}>{pet.emoji}</span>
                <div className="flex-1">
                  <span className="font-pixel text-[7px] text-rpg-text">{pet.name}</span>
                  {unlocked && petState && (
                    <span className="font-pixel text-[6px] text-rpg-muted ml-1">Lv.{petState.level}</span>
                  )}
                  {!unlocked && (
                    <span className="font-pixel text-[6px] text-rpg-muted ml-1">
                      Zone abschließen
                    </span>
                  )}
                </div>
                {unlocked && (
                  <button
                    onClick={() => isEquipped ? usePetStore.getState().unequipPet() : usePetStore.getState().equipPet(pet.id)}
                    className={`font-pixel text-[6px] px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                      isEquipped ? 'text-gold border-gold/30' : 'text-rpg-muted border-rpg-border hover:text-gold'
                    }`}
                  >
                    {isEquipped ? 'Aktiv' : 'Wählen'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
