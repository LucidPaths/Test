export interface VideoMeta {
  id: string
  title: string
  topic: string
  duration: string
  xpReward: number
  color: string
}

export const VIDEOS: VideoMeta[] = [
  { id: 'v1', title: 'Was ist ein ETF?', topic: 'ETFs', duration: '0:45', xpReward: 10, color: '#3b82f6' },
  { id: 'v2', title: 'Zinseszins erklärt', topic: 'Grundlagen', duration: '0:30', xpReward: 10, color: '#22c55e' },
  { id: 'v3', title: 'Bausparer: Lohnt sich das?', topic: 'Bausparen', duration: '0:55', xpReward: 15, color: '#f59e0b' },
  { id: 'v4', title: 'Sparplan einrichten in 2 Min', topic: 'Sparpläne', duration: '0:40', xpReward: 10, color: '#8b5cf6' },
  { id: 'v5', title: 'Risiko vs. Rendite', topic: 'Grundlagen', duration: '0:35', xpReward: 10, color: '#ef4444' },
  { id: 'v6', title: 'Dein erstes Investment', topic: 'Starter', duration: '1:00', xpReward: 20, color: '#06b6d4' },
  { id: 'v7', title: 'Inflation verstehen', topic: 'Grundlagen', duration: '0:50', xpReward: 15, color: '#ec4899' },
  { id: 'v8', title: '100K Challenge: Der Weg', topic: 'Motivation', duration: '0:45', xpReward: 10, color: '#fbbf24' },
]
