export interface Transaction {
  id: string
  amount: number
  label: string
  icon: string
  timestamp: number
}

export interface FinancialProduct {
  id: string
  name: string
  type: 'sparplan' | 'etf' | 'bausparer'
  description: string
  riskLevel: number // 1-5
  annualRate: number
  buffName: string
  buffDescription: string
  buffStat: 'attack' | 'defense' | 'critChance' | 'allStats'
  buffValue: number
  active: boolean
}