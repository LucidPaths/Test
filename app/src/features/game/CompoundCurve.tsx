import { useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot,
} from 'recharts'
import { useSavingsStore, getBlendedRate } from '../../stores/savingsStore'
import { projectBalance, monthsToTarget } from '../../engine/compound'

export function CompoundCurve() {
  const balance = useSavingsStore((s) => s.balance)
  const monthlyContribution = useSavingsStore((s) => s.monthlyContribution)
  const setMonthlyContribution = useSavingsStore((s) => s.setMonthlyContribution)
  const age = useSavingsStore((s) => s.age)
  const setAge = useSavingsStore((s) => s.setAge)
  const simulatedMonths = useSavingsStore((s) => s.simulatedMonths)
  const products = useSavingsStore((s) => s.products)
  const [expanded, setExpanded] = useState(true)

  // Chart projection rate: use blended product rate if products are active,
  // otherwise default to 4% (realistic long-term blended return for the pitch).
  // This is intentionally different from the game simulation's 2% Tagesgeld baseline —
  // the chart shows what's achievable with disciplined investing, not just a savings account.
  const CHART_DEFAULT_RATE = 0.04
  const annualRate = useMemo(() => {
    const blended = getBlendedRate(products)
    const hasActiveProducts = products.some((p) => p.active)
    return hasActiveProducts ? blended : CHART_DEFAULT_RATE
  }, [products])

  // Project the FULL journey from 0 to 100K so sliders have visible effect
  const mToTarget = monthsToTarget(0, monthlyContribution, annualRate, 100_000)
  const totalMonths = Math.min(1500, mToTarget + 12) // chart display cap at 125 years
  const data = useMemo(
    () => projectBalance(0, monthlyContribution, annualRate, totalMonths),
    [monthlyContribution, annualRate, totalMonths]
  )

  // Dynamic Y-axis: always start from 0, scale to show the full curve + 100K target
  const yMax = useMemo(() => {
    if (data.length === 0) return 1000
    const maxBalance = Math.max(...data.map((d) => d.balance))
    // Always show at least up to 110K so the target line is visible
    const ceiling = Math.max(maxBalance * 1.1, 110_000)
    // Round up to a clean number
    const order = Math.pow(10, Math.floor(Math.log10(ceiling)))
    return Math.ceil(ceiling / order) * order
  }, [data])

  const targetAge = age + Math.floor(mToTarget / 12)
  const targetMonthsRemain = mToTarget % 12
  const currentSimAge = age + Math.floor(simulatedMonths / 12)

  return (
    <div className="bg-rpg-panel border border-rpg-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 cursor-pointer"
      >
        <span className="font-pixel text-[9px] text-gold">
          Dein Weg zu 100K
        </span>
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[8px] text-xp-green">
            Ziel: Alter {targetAge}
          </span>
          <span className="text-rpg-muted text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-2 pb-3">
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 8, fill: '#888' }}
                  tickFormatter={(m: number) => `${age + Math.floor(m / 12)}`}
                  interval={Math.max(11, Math.floor(totalMonths / 6))}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: '#888' }}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`
                  }
                  width={35}
                  domain={[0, yMax]}
                />
                <Tooltip
                  contentStyle={{
                    background: '#16213e',
                    border: '1px solid #0f3460',
                    fontSize: 10,
                  }}
                  formatter={(value: number, name: string) => [
                    `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
                    name === 'balance'
                      ? 'Gesamt'
                      : name === 'contributions'
                        ? 'Einzahlungen'
                        : 'Zinsen',
                  ]}
                  labelFormatter={(m: number) =>
                    `Alter ${age + Math.floor(m / 12)} (Monat ${m})`
                  }
                />
                {/* 100K target line */}
                <ReferenceLine
                  y={100000}
                  stroke="#fbbf24"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="contributions"
                  stroke="#3b82f6"
                  fill="url(#colorContrib)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#22c55e"
                  fill="url(#colorBalance)"
                  strokeWidth={2}
                />
                {/* Current position */}
                <ReferenceDot
                  x={simulatedMonths}
                  y={balance}
                  r={5}
                  fill="#fbbf24"
                  stroke="#fbbf24"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Controls */}
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <label className="font-pixel text-[8px] text-rpg-muted w-14">Alter:</label>
              <input
                type="range"
                min={14}
                max={50}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="flex-1 accent-gold"
              />
              <span className="font-pixel text-[9px] text-gold w-8 text-right">{age}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-pixel text-[8px] text-rpg-muted w-14">Monatl.:</label>
              <input
                type="range"
                min={25}
                max={500}
                step={25}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="flex-1 accent-gold"
              />
              <span className="font-pixel text-[9px] text-gold w-12 text-right">
                €{monthlyContribution}
              </span>
            </div>

            <div className="font-pixel text-[8px] text-center space-y-0.5">
              <div className="text-gold">
                100K mit {targetAge} Jahren
              </div>
              <div className="text-rpg-muted">
                {(annualRate * 100).toFixed(1)}% p.a.
                {products.some((p) => p.active) ? ' (Produkt-Mix)' : ' (Durchschnitt)'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
