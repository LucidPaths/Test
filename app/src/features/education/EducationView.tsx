import { VideoFeed } from './VideoFeed'

export function EducationView() {
  return (
    <div className="flex flex-col flex-1 p-3 overflow-hidden">
      <div className="mb-3">
        <h2 className="font-pixel text-[11px] text-gold mb-1">Finanz-Akademie</h2>
        <p className="text-[10px] text-rpg-muted">
          Kurze Videos, die dich zum Finanz-Profi machen. Schau zu & verdiene XP!
        </p>
      </div>
      <VideoFeed />
    </div>
  )
}
