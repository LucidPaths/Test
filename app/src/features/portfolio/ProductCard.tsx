import type { FinancialProduct } from '../../types/savings'
import { useSavingsStore } from '../../stores/savingsStore'
import { useCharacterStore } from '../../stores/characterStore'

interface ProductCardProps {
  product: FinancialProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const toggleProduct = useSavingsStore((s) => s.toggleProduct)
  const balance = useSavingsStore((s) => s.balance)
  const products = useSavingsStore((s) => s.products)
  const recalculate = useCharacterStore((s) => s.recalculate)

  const riskDots = Array.from({ length: 5 }, (_, i) => i < product.riskLevel)
  const typeIcon = product.type === 'sparplan' ? '📈' : product.type === 'etf' ? '🌐' : '🏠'

  function handleToggle() {
    toggleProduct(product.id)
    // Recalculate with the toggled state
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, active: !p.active } : p
    )
    recalculate(balance, updated)
  }

  return (
    <div
      className={`bg-rpg-panel border-2 rounded-lg p-3 transition-all ${
        product.active ? 'border-gold/60 glow-gold' : 'border-rpg-border'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeIcon}</span>
          <div>
            <h3 className="font-pixel text-[10px] text-rpg-text">{product.name}</h3>
            <span className="text-[9px] text-rpg-muted">
              {(product.annualRate * 100).toFixed(1)}% p.a.
            </span>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`font-pixel text-[8px] px-3 py-1.5 rounded border cursor-pointer transition-all ${
            product.active
              ? 'bg-gold/20 border-gold text-gold'
              : 'bg-rpg-bg border-rpg-border text-rpg-muted hover:border-rpg-muted'
          }`}
        >
          {product.active ? 'AKTIV' : 'AKTIVIEREN'}
        </button>
      </div>

      <p className="text-[9px] text-rpg-muted mb-2">{product.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {riskDots.map((filled, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                filled ? 'bg-rpg-accent' : 'bg-rpg-border'
              }`}
            />
          ))}
          <span className="text-[7px] text-rpg-muted ml-1">Risiko</span>
        </div>

        <div className="flex items-center gap-1 bg-rpg-bg rounded px-2 py-0.5">
          <span className="text-sm">
            {product.type === 'sparplan' ? '📈' : product.type === 'etf' ? '🌐' : '🏠'}
          </span>
          <span className="font-pixel text-[7px] text-xp-green">{product.buffDescription}</span>
        </div>
      </div>
    </div>
  )
}
