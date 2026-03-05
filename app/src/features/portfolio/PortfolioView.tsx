import { useSavingsStore } from '../../stores/savingsStore'
import { ProductCard } from './ProductCard'

export function PortfolioView() {
  const products = useSavingsStore((s) => s.products)

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto flex-1">
      <div>
        <h2 className="font-pixel text-[11px] text-gold mb-1">VR-Portfolio</h2>
        <p className="text-[10px] text-rpg-muted">
          Aktiviere Finanzprodukte um Buffs für deinen Charakter freizuschalten.
        </p>
      </div>

      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      <div className="bg-rpg-panel border border-rpg-border rounded-lg p-3 mt-1">
        <div className="font-pixel text-[9px] text-rpg-muted text-center">
          Mehr Produkte verfügbar bei deiner VR Bank
        </div>
      </div>
    </div>
  )
}
