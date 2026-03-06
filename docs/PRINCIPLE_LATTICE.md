# Principle Lattice

**Decision framework for software that doesn't rot.**

---

## What This Is

These are axiomatic principles — non-negotiable values that guide every design decision, every line of code, every architectural choice. They aren't features. They aren't goals. They're the DNA.

When you're stuck on a decision, check it against the lattice. If a choice violates a principle, it's wrong — even if it "works." If it honors multiple principles simultaneously, it's probably right.

Each principle has **instantiations** — concrete proof that the principle lives in the codebase, not just on paper. A principle without instantiations is a wish. We don't do wishes.

---

## The Five Principles

### 1. Modularity

> *Lego blocks, not monoliths.*

Every component should be self-contained. Pull one out — that specific thing stops working. The rest stands. No module should be load-bearing for something unrelated to its purpose.

When two systems need to talk, build a bridge — don't duplicate. If data already lives somewhere, reference it. Don't maintain two copies of anything.

**Instantiations:**
- **7 independent Zustand stores** — `savingsStore`, `characterStore`, `gameStore`, `equipmentStore`, `spellStore`, `petStore`, `mercenaryStore` each own their state and persist independently. Resetting equipment doesn't touch savings.
- **Store actions enforce invariants** — `spendTokens()` checks balance before deducting; `healPlayer()` caps at maxHP and skips if dead; `upgradeItem()` lives in equipmentStore, not scattered across UI. Village components and LevelArena call actions, never mutate directly.
- **Shared types as single source of truth** — `Rarity`, `EquipSlot`, `Buff` types live in `types/` and are imported everywhere. No duplicate type definitions.
- **Engine layer is pure functions** — `compound.ts`, `progression.ts`, `loot.ts`, `buffs.ts`, `combat.ts`, `mercenaries.ts`, `spells.ts`, `pets.ts` have zero React imports. Stores call them; they don't call stores.

**Demands:**
- Each component fails independently — one breaking doesn't cascade
- No hidden coupling between unrelated modules
- Shared types and interfaces live in a single location
- Modules own their own state — they call APIs directly instead of threading state through a central orchestrator
- Plugin/extension points where future growth is expected

---

### 2. Simplicity Wins

> *Don't reinvent the wheel. Code exists to be used.*

The best code is code someone else already debugged. Use battle-tested libraries. If something already works — in your own git history, in someone else's MIT repo, in a standard library — use it. Only write novel code for novel problems.

Complexity is a cost, not a feature. Three clear lines beat one clever abstraction. A working simple solution beats an elegant broken one. Always.

**Instantiations:**
- **Zustand over Redux** — minimal boilerplate, `persist` middleware gives localStorage for free. No actions/reducers/sagas ceremony.
- **Recharts for compound curve** — battle-tested charting library instead of hand-rolled SVG/canvas. `<AreaChart>` does exactly what we need.
- **CSS scroll-snap for video feed** — no scroll library dependency. Native `scroll-snap-type: y mandatory` + `IntersectionObserver` handles the TikTok-style feed.
- **Ref-based RAF loop** — stores combat values in a ref, reads inside a stable `requestAnimationFrame` callback. Avoids dependency array churn without complex memoization.
- **`PROJECTION_RATE` exported const** — single 4% rate in gameBalances.ts, imported by savingsStore, OnboardingView, and CompoundCurve. No config system or env var for a hackathon prototype.

**Demands:**
- Before writing a new system, search for existing solutions first
- Before rewriting a function, check git history — maybe the old version worked
- If a dependency does 80% of the job, use it and handle the 20%
- Don't create abstractions for one-time operations

---

### 3. Errors Are Answers

> *Every failure teaches. Errors must be actionable.*

An error message that says "something went wrong" is itself a bug. Every error must say what happened, why, and what the user can do about it. Logs aren't optional — they're the program's memory of its own behavior.

**Instantiations:**
- **Honest Current State table** — CLAUDE.md maintains a status table for every game system (Working / MISSING / BROKEN). Updated each session.
- **Schmiede upgrade feedback** — success/fail result shows item name, new rarity, and animates in/out. Player knows exactly what happened.
- **Loot drop notifications** — rarity-colored toast with item name and emoji appears on enemy kill. No silent inventory additions.
- **Prestige celebration overlay** — "AUFSTIEG!" screen shows new level, amount invested, and stage reset message. Player understands the prestige mechanic.

**Demands:**
- Every error message is actionable (says what to do, not just what happened)
- Logs exist at key lifecycle events (startup, shutdown, errors, state changes)
- No silent failures — if something goes wrong, someone (user or developer) knows
- Maintain an honest status table in CLAUDE.md (Working / PARTIAL / MISSING / BROKEN) — never pretend something works when it doesn't

---

### 4. Fix The Pattern, Not The Instance

> *Cure the root cause. Don't treat symptoms.*

When you find a bug, the bug is never alone. The same mistake that caused it exists in 3-5 other places — you just haven't hit them yet. Search for the pattern. Fix every instance. If you only fix the one you found, you're treating symptoms while the disease spreads.

This applies to architecture too. If a design keeps producing the same class of bug, the design is wrong — not the individual bugs.

**Instantiations:**
- **Store mutation pattern** — found Taverne mutating gameStore directly. Grepped for `setState` in all village components, found same issue in Schmiede. Fixed both by adding `spendTokens()` and `upgradeItem()` store actions.
- **Nested scroll pattern** — user reported 3 scrollbars. Audited all components for `overflow-y-auto`, found 5 instances (VideoFeed, PortfolioView, EquipmentPanel, Schmiede, MilestoneTrack). Removed all, established single-scroll architecture. Added Trap #14 to prevent recurrence.
- **`buffStat` type safety** — found loose `string` type with unsafe `as` cast in buffs.ts. Tightened to union type in `FinancialProduct.buffStat`, which made the cast unnecessary and prevents invalid stat names at compile time.
- **Projection rate divergence** — OnboardingView pitched 2% while CompoundCurve showed 4% (hardcoded local const), and the simulation used a third value. Eliminated all separate rates — single `PROJECTION_RATE` (4%) in gameBalances.ts used everywhere. Added to cross-file contracts table.

**Demands:**
- Every bug fix includes a search for the same pattern across the codebase
- If a pattern produces bugs twice, add it to CLAUDE.md as a Trap so it never happens again
- Root cause analysis before fix — the error might be downstream of the real bug
- When you discover a cross-file contract (same string/format in two files), add it to the contracts table in CLAUDE.md

---

### 5. Secrets Stay Secret

> *Nothing left open to exploitation.*

API keys are not config — they're secrets. They belong in environment variables or encrypted storage, never in localStorage, never in plaintext, never logged, never in error messages. Security is not a feature you add later. It's a property of every line of code.

**Instantiations:**
- **No real bank credentials** — mock bank adapter (`adapters/mockBank.ts`) uses localStorage, no real API keys or bank connections in the hackathon prototype.
- **Closed-by-default token spending** — `spendTokens()` returns `false` if balance insufficient. UI disables buttons when `canUpgrade` is false. No way to spend tokens you don't have.
- **localStorage only stores game state** — no PII, no credentials, no secrets. Keys are versioned (`100k-savings-v1`) for safe schema evolution.

**Demands:**
- **Closed by default** — empty allowlists mean "deny all", not "allow all." Permissions, access lists, feature flags: the safe default is always "no"
- Audit any new storage mechanism for secret leakage
- Never log API keys, tokens, or credentials (even in debug mode)
- Environment variables for secrets, never committed to git
- `.env` files in `.gitignore` from day one
- When security logic exists in two layers (client + server), both MUST be updated together — one-sided updates are worse than none

---

## Using The Lattice

### For Design Decisions

When stuck between two approaches, score them against the principles:

| Approach A | Approach B |
|-----------|-----------|
| Violates #1 (couples two modules) | Honors #1 (clean separation) |
| Honors #2 (simpler) | Violates #2 (complex) |
| **Mixed — needs thought** | **Mixed — needs thought** |

If one approach cleanly honors more principles without violating any, it wins. If both violate something, find a third approach.

### For Code Review

Every PR can be checked: *does this change violate any principle?* Not "is this code clean" — that's subjective. "Does this violate the lattice" — that's answerable.

### For New Sessions

Read this document first. If Claude understands these 5 principles, it understands how this project thinks. The codebase is the implementation; the lattice is the intent.

---

*Lattice concept adapted from [vincitamore/claude-org-template](https://github.com/vincitamore/claude-org-template). Principles distilled from the [HIVE](https://github.com/LucidPaths/HiveMind) project.*
