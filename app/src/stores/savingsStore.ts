import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, FinancialProduct } from '../types/savings'
import { DEFAULT_PRODUCTS } from '../data/products'

interface SavingsStore {
  // User profile
  age: number
  setAge: (age: number) => void

  // Savings state
  balance: number
  monthlyContribution: number
  transactions: Transaction[]
  products: FinancialProduct[]

  // Simulated time — compressed months of saving
  simulatedMonths: number
  lastSimTick: number

  // Actions
  microSave: (amount: number, label: string, icon: string) => void
  setMonthlyContribution: (amount: number) => void
  toggleProduct: (productId: string) => void
  simulateTick: () => void // called by game loop — advances simulated savings
  resetGame: () => void
}

// Blended annual rate from active products, fallback to German savings baseline
function getBlendedRate(products: FinancialProduct[]): number {
  const active = products.filter((p) => p.active)
  if (active.length === 0) return 0.02 // German Tagesgeld baseline ~2%
  // Weighted blend: if you have ETF + Sparplan, rates combine
  return active.reduce((sum, p) => sum + p.annualRate, 0) / active.length
}

export const useSavingsStore = create<SavingsStore>()(
  persist(
    (set, get) => ({
      age: 18,
      balance: 0,
      monthlyContribution: 100,
      transactions: [],
      products: DEFAULT_PRODUCTS,
      simulatedMonths: 0,
      lastSimTick: Date.now(),

      setAge: (age) => set({ age: Math.max(14, Math.min(65, age)) }),

      microSave: (amount, label, icon) =>
        set((state) => ({
          balance: state.balance + amount,
          transactions: [
            {
              id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              amount,
              label,
              icon,
              timestamp: Date.now(),
            },
            ...state.transactions.slice(0, 49),
          ],
        })),

      setMonthlyContribution: (amount) =>
        set({ monthlyContribution: Math.max(25, Math.min(1000, amount)) }),

      toggleProduct: (productId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, active: !p.active } : p
          ),
        })),

      // Simulates one compressed "month" of saving — called periodically by game loop
      // In the demo, 1 real second = 1 simulated month
      simulateTick: () => {
        const state = get()
        const rate = getBlendedRate(state.products)
        const monthlyRate = rate / 12

        // Compound: balance grows by interest + monthly contribution
        const interest = state.balance * monthlyRate
        const newBalance = state.balance + interest + state.monthlyContribution

        set({
          balance: Math.round(newBalance * 100) / 100,
          simulatedMonths: state.simulatedMonths + 1,
          lastSimTick: Date.now(),
        })
      },

      resetGame: () =>
        set({
          balance: 0,
          simulatedMonths: 0,
          transactions: [],
          lastSimTick: Date.now(),
          products: DEFAULT_PRODUCTS,
        }),
    }),
    { name: '100k-savings-v2' }
  )
)
