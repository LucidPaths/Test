import type { Buff } from '../types/character'
import type { FinancialProduct } from '../types/savings'
import { getUnlockedMilestones } from './milestones'

export function getActiveBuffs(balance: number, products: FinancialProduct[]): Buff[] {
  const buffs: Buff[] = []

  // Milestone buffs
  for (const milestone of getUnlockedMilestones(balance)) {
    buffs.push({ ...milestone.buff, source: 'milestone' })
  }

  // Product buffs
  for (const product of products) {
    if (product.active) {
      buffs.push({
        id: `product-${product.id}`,
        name: product.buffName,
        icon: product.type === 'sparplan' ? '📈' : product.type === 'etf' ? '🌐' : '🏠',
        description: product.buffDescription,
        stat: product.buffStat as Buff['stat'],
        value: product.buffValue,
        source: 'product',
      })
    }
  }

  return buffs
}
