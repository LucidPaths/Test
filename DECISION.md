# Decision: 100K MVP — Tech Stack & Architecture

**Date:** 2026-03-05
**Status:** Proposed

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **React 18 + Vite** | Component modularity (Principle #1), fast HMR, zero-config TS |
| Language | **TypeScript** | Catches contract drift at compile time (Principle #3) |
| Styling | **Tailwind CSS** | Rapid prototyping, no CSS file sprawl, consistent design tokens |
| State | **Zustand** | Minimal boilerplate, modular stores per domain (savings, character, levels) |
| Routing | **React Router v6** | Tab-based navigation (Game / Education / Portfolio) |
| Charts | **Recharts** | Compound interest curve visualization, React-native, lightweight |
| Animations | **CSS + Framer Motion (light)** | Idle game ticks, level-up effects, micro-saving confirmations |
| Backend | **None (mock)** | Hackathon scope — localStorage + mock VR Bank API adapter |
| Build | **Vite** | Fast builds, good defaults |

**No backend.** The VR Bank API integration is mocked behind an adapter interface. When the real API exists, swap the adapter — game logic doesn't change.

---

## Architecture — Module Map

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router + layout shell
├── types/                      # Shared types (single source of truth)
│   ├── savings.ts              # SavingsAccount, Transaction, SparPlan
│   ├── character.ts            # Character, Buff, Equipment
│   └── game.ts                 # Level, Milestone, Progression
├── stores/                     # Zustand stores (one per domain)
│   ├── savingsStore.ts         # Balance, transactions, compound calc
│   ├── characterStore.ts       # RPG state, buffs, equipment
│   └── gameStore.ts            # Level progression, idle ticks, milestones
├── engine/                     # Pure logic (no React, fully testable)
│   ├── compound.ts             # Compound interest math, curve projection
│   ├── progression.ts          # XP thresholds, level difficulty scaling
│   ├── buffs.ts                # Buff calculations (savings milestones → effects)
│   └── milestones.ts           # Milestone definitions (€10, €100, €1K, €10K, €100K)
├── adapters/                   # External integrations (swappable)
│   ├── bankApi.ts              # Interface: getSavings, makeTransaction
│   └── mockBank.ts             # Mock implementation (localStorage)
├── components/                 # Reusable UI atoms
│   ├── ProgressBar.tsx
│   ├── MilestoneChip.tsx
│   ├── CurrencyDisplay.tsx
│   └── VideoCard.tsx
├── features/                   # Page-level feature modules
│   ├── game/                   # RPG idle game screen
│   │   ├── GameView.tsx        # Main game layout
│   │   ├── CharacterPanel.tsx  # Character + equipment + buffs
│   │   ├── LevelArena.tsx      # Current level + idle combat
│   │   ├── MicroSaveAction.tsx # "Upgrade sword for €0.50" buttons
│   │   └── CompoundCurve.tsx   # The exponential savings graph
│   ├── education/              # TikTok-style video feed
│   │   ├── EducationView.tsx
│   │   └── VideoFeed.tsx       # Short-form financial literacy videos
│   └── portfolio/              # Sparplan / ETF / Bausparer status
│       ├── PortfolioView.tsx
│       └── ProductCard.tsx     # Each financial product → game effect mapping
└── data/                       # Static game data (levels, buffs, products)
    ├── levels.ts               # Level definitions with difficulty curve
    ├── buffs.ts                # Milestone → buff mapping
    ├── products.ts             # VR Bank products (ETF, Bausparer, etc.)
    └── videos.ts               # Educational video metadata
```

---

## Core Game Mechanics

### 1. The Compound Curve (Central Metaphor)
- X-axis: time, Y-axis: €0 → €100K
- Curve shape: `balance * (1 + rate)^months + monthly_contribution * ((1 + rate)^months - 1) / rate`
- User controls: monthly savings amount, sporadic micro-saves
- The curve updates live as you save — visual feedback loop

### 2. Micro-Savings as RPG Actions
- "Sharpen Sword — €0.50" → transfers €0.50 from checking → savings
- "Buy Health Potion — €1.00" → transfers €1.00
- "Forge Armor — €2.00" → transfers €2.00
- Each action = real micro-transfer (mocked) + in-game buff/item
- Framing: "you're not spending, you're investing in your character"

### 3. Progression / Difficulty
- Levels scale with savings milestones:
  - Lvl 1-10: €0–€100 (easy, tutorial)
  - Lvl 11-25: €100–€1,000 (learning curve)
  - Lvl 26-50: €1K–€10K (mid-game grind)
  - Lvl 51-80: €10K–€50K (endgame)
  - Lvl 81-100: €50K–€100K (legendary)
- Higher levels = enemies with more HP = need more savings velocity
- Idle mechanic: character auto-fights, but progress slows without active saving

### 4. Permanent Buffs from Milestones
- €10 saved → "Copper Shield" (+5% idle damage)
- €100 → "Iron Blade" (+10% crit chance)
- €1,000 → "Steel Armor" (+20% defense, unlocks mid-tier levels)
- €10,000 → "Mythril Set" (+50% all stats)
- €100,000 → "Legendary Status" (final form, game complete)

### 5. Financial Product Bonuses
- Active Sparplan → "+15% XP gain" (consistent saving = faster progression)
- ETF portfolio → "Elemental Resistance" (diversification = defense)
- Bausparer → "Fortress buff" (long-term commitment = base defense)
- These are toggleable based on real account products

### 6. Education Tab
- TikTok-style vertical scroll of short videos (30-60s)
- Topics: "What is an ETF?", "Compound interest explained", "Bausparer 101"
- Watching a video = small XP reward
- Links to VR Bank product pages

---

## Milestones for Hackathon Demo

### Must-have (demo day)
- [ ] Compound interest curve with adjustable monthly savings
- [ ] Character panel with level, HP, basic stats
- [ ] 3-5 micro-saving actions that move money and buff character
- [ ] Level progression tied to savings balance
- [ ] Milestone unlocks with visual feedback
- [ ] Basic idle combat animation (CSS)
- [ ] Mobile-responsive layout

### Nice-to-have (polished MVP)
- [ ] Education tab with video placeholders
- [ ] Portfolio tab showing product → buff mapping
- [ ] Idle tick system (character progresses while away)
- [ ] Sound effects for level-up / milestone
- [ ] VR Bank branded theme
- [ ] Onboarding flow / tutorial

---

## Key Constraints
- **No real bank API** — everything is mocked behind `adapters/bankApi.ts`
- **No backend/database** — localStorage for persistence
- **No auth** — single-user demo mode
- **Financially plausible** — compound interest math must use real formulas, not fantasy numbers
- **Mobile-first** — young adult target audience = phone-first
