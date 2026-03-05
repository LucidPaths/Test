# 100K Quest — Hack Your Future

A financial literacy RPG idle game for VR Bank that gamifies the journey to saving EUR 100K. Built as a hackathon prototype with a Claude Code starter kit for development quality.

**Core metaphor:** real savings transactions power RPG character progression along a compound interest curve. Save money → level up → fight monsters → earn tokens → upgrade gear → repeat.

## Quick Start

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:5173` on a mobile viewport (375×812).

## Tech Stack

- **React + TypeScript + Vite** — fast builds, type safety
- **Tailwind CSS v4** — utility-first styling with `@theme` directive
- **Zustand** — state management with `persist` middleware (4 stores)
- **Framer Motion** — animations (loot drops, prestige, damage numbers)
- **Recharts** — compound interest visualization
- **Press Start 2P** — pixel art font

## Game Architecture

```
app/src/
├── engine/              # Pure game math (no React)
│   ├── compound.ts      # Compound interest projections
│   ├── progression.ts   # Level/XP/DPS from balance
│   ├── loot.ts          # Drop rates, rarity, pity system
│   ├── buffs.ts         # Milestone + product buff calculations
│   └── milestones.ts    # Savings milestone definitions
├── stores/              # Zustand state (persisted to localStorage)
│   ├── savingsStore.ts  # Balance, transactions, products
│   ├── characterStore.ts # Level, stats derived from balance
│   ├── gameStore.ts     # Enemy HP, combat tokens, damage
│   └── equipmentStore.ts # Inventory, equipped gear, stages
├── types/               # Shared TypeScript types
│   ├── equipment.ts     # Rarity, EquipSlot, GearItem, RARITY_CONFIG
│   ├── character.ts     # Character, Buff types
│   ├── savings.ts       # Transaction, FinancialProduct
│   └── game.ts          # DamageNumber, EnemyState
├── features/
│   ├── game/            # Main tab: arena, character, curve, micro-save
│   ├── village/         # Village tab: Taverne, Schmiede, Akademie
│   ├── portfolio/       # Portfolio tab: financial products → buffs
│   ├── education/       # Video feed (used by Akademie)
│   └── onboarding/      # First-time setup flow
├── components/          # Shared UI atoms (HealthBar, StatBadge, etc.)
├── data/                # Static game content (facts, products, videos)
└── App.tsx              # Router + layout + tab navigation
```

## Key Game Systems

| System | Description |
|--------|-------------|
| **Micro-saves** | RPG-themed buttons that add real EUR to savings balance |
| **Idle combat** | RAF loop deals DPS to enemies, drops loot on kill |
| **Loot & equipment** | 5 rarity tiers, 4 gear slots, pity counter (15 threshold) |
| **Prestige** | Monthly deposit resets combat stage, boosts power |
| **Village** | Spend combat tokens: Taverne (facts), Schmiede (upgrades), Akademie (videos) |
| **Compound curve** | Recharts visualization of savings growth over time |
| **Milestones** | €10 → €100 → €1K → €10K → €100K unlock permanent buffs |

## Claude Code Starter Kit

This repo includes a portable development harness for Claude Code sessions:

| File | Type | Purpose |
|------|------|---------|
| `CLAUDE.md` | Mixed | Project instructions — universal coding standards (fixed) + project-specific sections (adaptive) |
| `docs/PRINCIPLE_LATTICE.md` | Mixed | 5 axiomatic design principles — axioms are fixed, instantiations grow with your project |
| `.claude/settings.json` | Fixed | Registers session-start and session-stop hooks |
| `.claude/hooks/session-start.py` | Fixed | Auto-injects git state and next steps at session start |
| `.claude/hooks/maintenance-check.py` | Fixed | Blocks session end if code changed but docs weren't updated |
| `.claude/skills/structured-reasoning.md` | Fixed | Decision framework: priority hierarchy, stuck protocol, decomposition triggers |
| `.claude/skills/project-status.md` | Fixed | `/project-status` skill for quick project state overview |
| `.claude/skills/research-then-implement.md` | Fixed | `/research-decide` skill — two-phase research → implement |
| `.claude/skills/adversarial-review.md` | Fixed | `/adversarial-review` skill — three-pass bug verification |
| `.claude/PR_GUIDELINES.md` | Fixed | Standardized PR description format and commit conventions |
| `docs/TASK_CONTRACT_TEMPLATE.md` | Template | Copy per-task to define explicit acceptance criteria |

### Fixed vs Adaptive

**Fixed** files contain universal truths — coding standards, decision frameworks, git workflows. They work as-is in any project.

**Adaptive** sections (marked with `<!-- [ADAPT] ... -->` in HTML comments) are placeholders filled with project-specific content. These include: cross-file contracts, project traps, current state tables, and principle instantiations.

## Requirements

- **Python 3** — Required for the session hooks (most systems have this)
- **Git** — Required for session-start orientation and maintenance checks
- **Claude Code** — The CLI tool this kit is designed for

## The Principle Lattice

Five principles guide every decision:

1. **Modularity** — Lego blocks, not monoliths
2. **Simplicity Wins** — Don't reinvent the wheel
3. **Errors Are Answers** — Every failure teaches
4. **Fix The Pattern** — Cure the root cause, not the symptom
5. **Secrets Stay Secret** — Nothing left open to exploitation

See `docs/PRINCIPLE_LATTICE.md` for the full lattice with details and demands.

## Credits

- Principle lattice concept and hook patterns adapted from [vincitamore/claude-org-template](https://github.com/vincitamore/claude-org-template)
- Distilled from the [HIVE](https://github.com/LucidPaths/HiveMind) project by LucidPaths
