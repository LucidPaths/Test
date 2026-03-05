import { CompoundCurve } from './CompoundCurve'
import { LevelArena } from './LevelArena'
import { CharacterPanel } from './CharacterPanel'
import { EquipmentPanel } from './EquipmentPanel'
import { MicroSaveAction } from './MicroSaveAction'
import { MilestoneTrack } from './MilestoneTrack'
import { SkipMonthButton } from './SkipMonthButton'

export function GameView() {
  return (
    <div className="flex flex-col gap-3 p-3">
      <CompoundCurve />
      <SkipMonthButton />
      <MilestoneTrack />
      <LevelArena />
      <EquipmentPanel />
      <CharacterPanel />
      <MicroSaveAction />
    </div>
  )
}
