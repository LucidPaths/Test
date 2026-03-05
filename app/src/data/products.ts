import type { FinancialProduct } from '../types/savings'

// Realistic German rates as of 2025-2026
// VR Bank Tagesgeld: ~1.5-2.0%, Sparplan: ~2-3%
// ETF world (MSCI World historical avg): ~7% nominal, ~5% after inflation
// Bausparer: ~1-1.5% Guthabenzins, but government bonus (Wohnungsbauprämie)
export const DEFAULT_PRODUCTS: FinancialProduct[] = [
  {
    id: 'sparplan-50',
    name: 'VR-Sparplan',
    type: 'sparplan',
    description: 'Monatlicher Sparplan ab 25€. Regelmäßiges Sparen bringt stetige Fortschritte. Aktuell ~2.5% p.a.',
    riskLevel: 1,
    annualRate: 0.025, // VR Bank Sparplan ~2.5%
    buffName: 'Disziplin-Aura',
    buffDescription: '+15% XP-Gewinn',
    buffStat: 'xpMultiplier',
    buffValue: 0.15,
    active: false,
  },
  {
    id: 'etf-world',
    name: 'VR-ETF Portfolio',
    type: 'etf',
    description: 'MSCI World ETF — breit gestreut über 1.500+ Unternehmen weltweit. Historisch ~7% p.a. Höhere Rendite, höheres Risiko.',
    riskLevel: 3,
    annualRate: 0.07, // MSCI World long-term average
    buffName: 'Element-Resistenz',
    buffDescription: '+10% Verteidigung',
    buffStat: 'defense',
    buffValue: 0.10,
    active: false,
  },
  {
    id: 'bausparer',
    name: 'VR-Bausparer',
    type: 'bausparer',
    description: 'Bausparvertrag mit staatlicher Förderung. Guthabenzins ~1.5% + Wohnungsbauprämie. Langfristige Sicherheit.',
    riskLevel: 1,
    annualRate: 0.015, // Bausparer Guthabenzins
    buffName: 'Festungs-Buff',
    buffDescription: '+20% Verteidigung',
    buffStat: 'defense',
    buffValue: 0.20,
    active: false,
  },
]
