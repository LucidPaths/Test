import { CompoundCurve } from './CompoundCurve'
import { LevelArena } from './LevelArena'
import { CharacterPanel } from './CharacterPanel'
import { MicroSaveAction } from './MicroSaveAction'
import { MilestoneTrack } from './MilestoneTrack'

export function GameView() {
  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto flex-1">
      <CompoundCurve />
      <MilestoneTrack />
      <LevelArena />
      <CharacterPanel />
      <MicroSaveAction />
    </div>
  )
}
