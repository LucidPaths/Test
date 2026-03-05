import { VideoFeed } from '../education/VideoFeed'

export function Akademie({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="font-pixel text-[8px] text-rpg-muted cursor-pointer hover:text-rpg-text transition-colors"
        >
          ← Zurück
        </button>
        <span className="font-pixel text-[10px] text-gold">📚 Akademie</span>
      </div>

      <p className="font-pixel text-[7px] text-rpg-muted">
        Kurze Videos, die dich zum Finanz-Profi machen.
      </p>

      <VideoFeed />
    </div>
  )
}
