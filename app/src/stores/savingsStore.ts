import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, FinancialProduct } from '../types/savings'
import { DEFAULT_PRODUCTS } from '../data/products'
import { AGE_MIN, AGE_MAX, MONTHLY_CONTRIBUTION_MIN, MONTHLY_CONTRIBUTION_MAX, MAX_TRANSACTION_HISTORY } from '../constants/gameBalances'

export type Gender = 'male' | 'female'

interface SavingsStore {
  // User profile
  age: number
  gender: Gender
  setAge: (age: number) => void
  setGender: (gender: Gender) => void

  // Game state
  started: boolean
  startGame: () => void

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

// German Tagesgeld baseline rate — single source of truth
// Cross-file contract: OnboardingView and CompoundCurve both reference this
export const BASELINE_RATE = 0.02

// Blended annual rate from active products, fallback to baseline
// Single source of truth — also used by CompoundCurve for projection
export function getBlendedRate(products: FinancialProduct[]): number {
  const active = products.filter((p) => p.active)
  if (active.length === 0) return BASELINE_RATE
  // Weighted blend: if you have ETF + Sparplan, rates combine
  return active.reduce((sum, p) => sum + p.annualRate, 0) / active.length
}

export const useSavingsStore = create<SavingsStore>()(
  persist(
    (set, get) => ({
      age: 18,
      gender: 'male' as Gender,
      started: false,
      balance: 0,
      monthlyContribution: 100,
      transactions: [],
      products: DEFAULT_PRODUCTS,
      simulatedMonths: 0,
      lastSimTick: Date.now(),

      setAge: (age) => set({ age: Math.max(AGE_MIN, Math.min(AGE_MAX, age)) }),
      setGender: (gender) => set({ gender }),
      startGame: () => set({ started: true }),

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
            ...state.transactions.slice(0, MAX_TRANSACTION_HISTORY - 1),
          ],
        })),

      setMonthlyContribution: (amount) =>
        set({ monthlyContribution: Math.max(MONTHLY_CONTRIBUTION_MIN, Math.min(MONTHLY_CONTRIBUTION_MAX, amount)) }),

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
        if (!state.started) return
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
          started: false,
          age: 18,
          gender: 'male' as Gender,
          balance: 0,
          monthlyContribution: 100,
          simulatedMonths: 0,
          transactions: [],
          lastSimTick: Date.now(),
          products: DEFAULT_PRODUCTS,
        }),
    }),
    { name: '100k-savings-v2' }
  )
)
