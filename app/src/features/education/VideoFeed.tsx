import { VIDEOS } from '../../data/videos'

export function VideoFeed() {
  return (
    <div className="flex flex-col gap-3">
      {VIDEOS.map((video) => (
        <div
          key={video.id}
          className="snap-start min-h-[200px] bg-rpg-panel border border-rpg-border rounded-lg overflow-hidden flex-shrink-0"
        >
          <div
            className="h-[140px] flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${video.color}33, ${video.color}11)` }}
          >
            <span className="text-5xl opacity-30">📹</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors">
                <span className="text-2xl ml-1">▶</span>
              </div>
            </div>
            <span className="absolute top-2 right-2 font-pixel text-[8px] bg-black/50 px-2 py-1 rounded">
              {video.duration}
            </span>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-[10px] text-rpg-text">{video.title}</h3>
              <span
                className="font-pixel text-[7px] px-2 py-0.5 rounded"
                style={{ background: `${video.color}33`, color: video.color }}
              >
                {video.topic}
              </span>
            </div>
            <div className="mt-1 font-pixel text-[8px] text-xp-green">
              +{video.xpReward} XP beim Ansehen
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
