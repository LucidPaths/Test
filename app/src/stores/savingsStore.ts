import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, FinancialProduct } from '../types/savings'
import { DEFAULT_PRODUCTS } from '../data/products'

interface SavingsStore {
  balance: number
  monthlyContribution: number
  transactions: Transaction[]
  products: FinancialProduct[]
  microSave: (amount: number, label: string, icon: string) => void
  setMonthlyContribution: (amount: number) => void
  toggleProduct: (productId: string) => void
}

export const useSavingsStore = create<SavingsStore>()(
  persist(
    (set) => ({
      balance: 0,
      monthlyContribution: 50,
      transactions: [],
      products: DEFAULT_PRODUCTS,

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
            ...state.transactions.slice(0, 49), // keep last 50
          ],
        })),

      setMonthlyContribution: (amount) =>
        set({ monthlyContribution: Math.max(0, amount) }),

      toggleProduct: (productId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, active: !p.active } : p
          ),
        })),
    }),
    { name: '100k-savings' }
  )
)
