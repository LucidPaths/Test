import { CompoundCurve } from './CompoundCurve'
import { LevelArena } from './LevelArena'
import { CharacterPanel } from './CharacterPanel'
import { EquipmentPanel } from './EquipmentPanel'
import { MicroSaveAction } from './MicroSaveAction'
import { MilestoneTrack } from './MilestoneTrack'
import { SkipMonthButton } from './SkipMonthButton'
import { PetPanel } from './PetPanel'
import { usePetStore } from '../../stores/petStore'

export function GameView() {
  const hasAnyPet = usePetStore((s) => s.unlockedPetIds.length > 0)

  return (
    <div className="flex flex-col gap-3 p-3">
      <CompoundCurve />
      <SkipMonthButton />
      <MilestoneTrack />
      <LevelArena />
      {hasAnyPet && <PetPanel />}
      <EquipmentPanel />
      <CharacterPanel />
      <MicroSaveAction />
    </div>
  )
}
