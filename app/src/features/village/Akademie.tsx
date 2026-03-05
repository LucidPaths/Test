import { VideoFeed } from '../education/VideoFeed'

export function Akademie({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col flex-1 p-3 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="font-pixel text-[8px] text-rpg-muted cursor-pointer hover:text-rpg-text transition-colors"
        >
          ← Zurück
        </button>
        <span className="font-pixel text-[10px] text-gold">📚 Akademie</span>
      </div>

      <p className="font-pixel text-[7px] text-rpg-muted mb-3">
        Kurze Videos, die dich zum Finanz-Profi machen.
      </p>

      <VideoFeed />
    </div>
  )
}
