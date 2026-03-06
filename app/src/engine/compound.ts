export interface ProjectionPoint {
  month: number
  balance: number
  contributions: number
  interest: number
}

/**
 * Projects compound interest growth over time.
 * Formula: A = P(1+r/n)^(nt) + C * ((1+r/n)^(nt) - 1) / (r/n)
 * Where P = principal, r = annual rate, n = compounding periods/year,
 * C = monthly contribution, t = time in years
 */
export function projectBalance(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  totalMonths: number
): ProjectionPoint[] {
  const points: ProjectionPoint[] = []
  const monthlyRate = annualRate / 12

  let balance = principal
  let totalContributions = principal

  for (let month = 0; month <= totalMonths; month++) {
    const interest = balance - totalContributions
    points.push({
      month,
      balance: Math.round(balance * 100) / 100,
      contributions: Math.round(totalContributions * 100) / 100,
      interest: Math.round(Math.max(0, interest) * 100) / 100,
    })

    // Apply interest then add contribution
    balance = balance * (1 + monthlyRate) + monthlyContribution
    totalContributions += monthlyContribution
  }

  return points
}

/**
 * Calculate months to reach target balance.
 * No artificial cap — returns actual months needed so callers show correct values.
 * Safety guard at 2400 months (200 years) prevents infinite loops only.
 */
export function monthsToTarget(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  target: number
): number {
  const monthlyRate = annualRate / 12
  let balance = principal
  let months = 0
  const maxMonths = 2400 // safety guard — no realistic scenario exceeds 200 years

  while (balance < target && months < maxMonths) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
    months++
  }

  return months
}
