import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'
import { useSavingsStore } from '../../stores/savingsStore'
import { projectBalance, monthsToTarget } from '../../engine/compound'

export function CompoundCurve() {
  const balance = useSavingsStore((s) => s.balance)
  const monthlyContribution = useSavingsStore((s) => s.monthlyContribution)
  const setMonthlyContribution = useSavingsStore((s) => s.setMonthlyContribution)
  const products = useSavingsStore((s) => s.products)
  const [expanded, setExpanded] = useState(false)

  // Weighted average annual rate from active products, default 4%
  const annualRate = useMemo(() => {
    const active = products.filter((p) => p.active)
    if (active.length === 0) return 0.04
    return active.reduce((sum, p) => sum + p.annualRate, 0) / active.length
  }, [products])

  const totalMonths = 360 // 30 years
  const data = useMemo(
    () => projectBalance(balance, monthlyContribution, annualRate, totalMonths),
    [balance, monthlyContribution, annualRate, totalMonths]
  )

  const mToTarget = monthsToTarget(balance, monthlyContribution, annualRate, 100_000)
  const yearsToTarget = Math.floor(mToTarget / 12)
  const monthsRemain = mToTarget % 12

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 cursor-pointer"
      >
        <span className="font-pixel text-[9px] text-gold">Zinseszins-Projektion</span>
        <span className="text-rpg-muted text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-2 pb-3">
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 8, fill: '#888' }}
                  tickFormatter={(m: number) => `${Math.floor(m / 12)}J`}
                  interval={59}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: '#888' }}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
                  width={35}
                />
                <Tooltip
                  contentStyle={{ background: '#16213e', border: '1px solid #0f3460', fontSize: 10 }}
                  formatter={(value: number, name: string) => [
                    `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
                    name === 'balance' ? 'Gesamt' : name === 'contributions' ? 'Einzahlungen' : 'Zinsen',
                  ]}
                  labelFormatter={(m: number) => `Monat ${m} (${(m / 12).toFixed(1)} Jahre)`}
                />
                <Area type="monotone" dataKey="contributions" stroke="#3b82f6" fill="url(#colorContrib)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="balance" stroke="#22c55e" fill="url(#colorInterest)" strokeWidth={2} />
                <ReferenceDot x={0} y={balance} r={4} fill="#fbbf24" stroke="#fbbf24" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <label className="font-pixel text-[8px] text-rpg-muted whitespace-nowrap">
                Monatlich:
              </label>
              <input
                type="range"
                min={25}
                max={500}
                step={25}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="flex-1 accent-gold"
              />
              <span className="font-pixel text-[9px] text-gold w-16 text-right">
                €{monthlyContribution}
              </span>
            </div>

            <div className="font-pixel text-[8px] text-rpg-muted text-center">
              100K in ~{yearsToTarget}J {monthsRemain}M bei {(annualRate * 100).toFixed(1)}% p.a.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
