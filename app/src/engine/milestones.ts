import type { Buff } from '../types/character'

export interface Milestone {
  threshold: number
  name: string
  icon: string
  description: string
  buff: Omit<Buff, 'source'>
  tier: number
}

export const MILESTONES: Milestone[] = [
  {
    threshold: 10,
    name: 'Copper Shield',
    icon: '🛡️',
    description: 'Your first line of defense',
    tier: 1,
    buff: { id: 'milestone-10', name: 'Copper Shield', icon: '🛡️', description: '+5% idle damage', stat: 'attack', value: 0.05 },
  },
  {
    threshold: 100,
    name: 'Iron Blade',
    icon: '⚔️',
    description: 'A warrior\'s true companion',
    tier: 2,
    buff: { id: 'milestone-100', name: 'Iron Blade', icon: '⚔️', description: '+10% crit chance', stat: 'critChance', value: 0.10 },
  },
  {
    threshold: 1_000,
    name: 'Steel Armor',
    icon: '🏰',
    description: 'Fortified for the mid-game',
    tier: 3,
    buff: { id: 'milestone-1000', name: 'Steel Armor', icon: '🏰', description: '+20% defense', stat: 'defense', value: 0.20 },
  },
  {
    threshold: 10_000,
    name: 'Mythril Set',
    icon: '💎',
    description: 'Legendary craftsmanship',
    tier: 4,
    buff: { id: 'milestone-10000', name: 'Mythril Set', icon: '💎', description: '+50% all stats', stat: 'allStats', value: 0.50 },
  },
  {
    threshold: 100_000,
    name: 'Legendary Status',
    icon: '👑',
    description: 'You\'ve reached 100K. Legendary.',
    tier: 5,
    buff: { id: 'milestone-100000', name: 'Legendary Status', icon: '👑', description: '+100% all stats', stat: 'allStats', value: 1.0 },
  },
]

export function getUnlockedMilestones(balance: number): Milestone[] {
  return MILESTONES.filter(m => balance >= m.threshold)
}

export function getNextMilestone(balance: number): Milestone | null {
  return MILESTONES.find(m => balance < m.threshold) ?? null
}

export function getMilestoneProgress(balance: number): number {
  const next = getNextMilestone(balance)
  if (!next) return 1

  const prevThreshold = MILESTONES[MILESTONES.indexOf(next) - 1]?.threshold ?? 0
  const range = next.threshold - prevThreshold
  const progress = (balance - prevThreshold) / range
  return Math.min(1, Math.max(0, progress))
}
