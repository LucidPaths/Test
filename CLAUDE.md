# Project Instructions for Claude Code

> **First Session Bootstrap:** When starting your first session on this project, explore the codebase and fill in all `[ADAPT]` sections below. Read the code, understand the structure, document what you find. Future sessions depend on this orientation. The `[ADAPT]` markers are inside HTML comments — replace them with real content.

---

## Project Overview

A portable Claude Code starter kit (harness) that you drop into any repo to bootstrap high-quality, auditable AI-assisted development. It provides session hooks, coding standards, skills, and documentation templates — not application code. Distilled from battle-tested patterns in the [HIVE](https://github.com/LucidPaths/HiveMind) project.

### What This Project Is NOT

- **NOT an application.** There is no source code to build, run, or deploy. Don't suggest adding application logic, endpoints, or features.
- **NOT a library or package.** There are no exports, no `package.json`, no installable module. Don't add dependency management.
- **NOT project-specific.** The "Fixed" files are universal templates. Don't hardcode project-specific values into fixed files — that belongs in `[ADAPT]` sections only.
- **NOT meant to be forked and diverged.** It's a drop-in kit. Changes should improve the universal templates, not specialize them.

## Key Directories

```
├── CLAUDE.md                          # Project instructions (this file) — mixed fixed + adaptive
├── README.md                          # User-facing docs: what the kit is, quick start
├── LICENSE                            # MIT License
├── docs/
│   ├── PRINCIPLE_LATTICE.md           # 5 axiomatic design principles with instantiation slots
│   └── TASK_CONTRACT_TEMPLATE.md      # Copy per-task for acceptance criteria
└── .claude/
    ├── settings.json                  # Registers session hooks (SessionStart, Stop)
    ├── PR_GUIDELINES.md               # Standardized PR description format
    ├── hooks/
    │   ├── session-start.py           # Auto-injects git state + next steps at session start
    │   └── maintenance-check.py       # Blocks session end if code changed but docs weren't updated
    └── skills/
        ├── adversarial-review.md      # /adversarial-review — three-pass bug verification
        ├── project-status.md          # /project-status — quick project state overview
        ├── research-then-implement.md # /research-decide — two-phase research → implement
        └── structured-reasoning.md    # Decision framework: priority hierarchy, stuck protocol
```

## Principles

This project follows 5 axiomatic principles. See [`docs/PRINCIPLE_LATTICE.md`](docs/PRINCIPLE_LATTICE.md) for the full lattice with details.

| # | Principle | Axiom |
|---|-----------|-------|
| 1 | **Modularity** | Lego blocks, not monoliths |
| 2 | **Simplicity Wins** | Don't reinvent the wheel. Code exists to be used |
| 3 | **Errors Are Answers** | Every failure teaches. Errors must be actionable |
| 4 | **Fix The Pattern** | Cure the root cause. Don't treat symptoms |
| 5 | **Secrets Stay Secret** | Nothing left open to exploitation |

When making design decisions, check against these principles. If a choice violates one, reconsider.

## Development Guidelines

- Python 3 is required for the session hooks (`session-start.py`, `maintenance-check.py`)
- Git is required — hooks rely on `git` commands for orientation and maintenance checks
- Files marked "Fixed" in README.md should not be modified unless improving the universal template
- `[ADAPT]` sections (inside HTML comments) are the only parts meant to be project-specific — fill them in, don't delete the surrounding structure
- Hook registration lives in `.claude/settings.json` — if you add a new hook script, register it there
- The `maintenance-check.py` hook uses a `TRIVIAL_SESSION_THRESHOLD` of 15 lines — sessions shorter than that skip the doc-update check
- `CODE_EXTENSIONS` in `maintenance-check.py` defines which file types trigger the doc-update reminder — extend it if your project uses unlisted extensions

## Common Tasks

### Building
No build step — this is a documentation/config kit, not compiled code.

### Running Development Mode
No dev server — drop these files into a target repo and start a Claude Code session.

### Running Tests
No test suite. Hooks can be tested manually:
- `echo '{}' | python3 .claude/hooks/session-start.py` — should output JSON with `additionalContext`
- `maintenance-check.py` requires a `transcript_path` in stdin JSON to run meaningfully

## Architecture Patterns

### Hook Architecture
- **SessionStart hook** (`session-start.py`): Reads stdin JSON, gathers git state (branch, recent commits, uncommitted changes) and next steps from `ROADMAP.md`/`TODO.md`, outputs `{"additionalContext": "..."}` to inject orientation into the session.
- **Stop hook** (`maintenance-check.py`): Reads stdin JSON with `transcript_path`, checks if code files were modified (via `git diff`), and blocks session end with a doc-update reminder if code changed but docs weren't updated. Sessions under 15 transcript lines are skipped. If Claude states "No maintenance needed" in the last 2000 chars of transcript, the check passes.

### Fixed vs Adaptive Pattern
Files are categorized as **Fixed** (universal, don't modify) or **Adaptive** (project-specific, fill in `[ADAPT]` markers). This separation lets the kit be dropped into any repo without conflict.

### Skills Pattern
Skills in `.claude/skills/` are markdown files that define structured prompts invokable via `/skill-name`. They don't contain executable code — they instruct Claude on how to perform a specific workflow (adversarial review, research-then-implement, etc.).

## Things to Avoid

These are universal anti-patterns that cause real damage. They apply every session.

- **Don't add features, refactoring, or "improvements" beyond what was asked.** A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability.
- **Don't add error handling for scenarios that can't happen.** Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs).
- **Don't create helpers or abstractions for one-time operations.** Three similar lines of code is better than a premature abstraction. Don't design for hypothetical future requirements.
- **Don't add docstrings, comments, or type annotations to code you didn't change.** Touch only what's relevant to the task.
- **Don't use subagents/task tools for research.** Do research directly with Read/Grep/Glob. Subagents burn 5-10x more tokens for the same result. Only use subagents for truly independent parallel *write* tasks.
- **Don't leave backwards-compatibility shims.** No renaming unused `_vars`, no re-exporting dead types, no `// removed` comments. If it's unused, delete it completely.

- **Don't modify "Fixed" files to add project-specific content.** Fixed files are universal templates. Project-specific content goes only in `[ADAPT]` sections of CLAUDE.md and the `Instantiations` sections of PRINCIPLE_LATTICE.md.
- **Don't add application code to this repo.** This is a harness/kit, not an app. If you need to test something, do it in a separate repo that consumes this kit.
- **Don't hardcode paths in hooks.** The hooks use `get_project_root()` to resolve the project root dynamically. Keep it that way.

## Cross-File Contracts

When two files must agree on a string value, format, or list — there MUST be a single source of truth that both reference. This is the #1 source of silent bugs in every multi-file codebase.

**When you discover a cross-file contract:**
1. First, try to make it a single file (best — builder + parser in one place)
2. If language boundaries prevent that, add explicit cross-reference comments in BOTH files
3. Add the contract to this table
4. If the contract is security-sensitive, add a test asserting both sides match

| Contract | Source of Truth | Mirror | Sync Method |
|----------|----------------|--------|-------------|
| Hook registration | `.claude/settings.json` | `.claude/hooks/*.py` (filenames) | Manual — if you add/rename a hook script, update settings.json |
| CODE_EXTENSIONS list | `.claude/hooks/maintenance-check.py` | None (single source) | N/A — only lives in one place |
| Principle names & numbers | `docs/PRINCIPLE_LATTICE.md` | `CLAUDE.md` Principles table | Manual — keep the table in CLAUDE.md in sync with the lattice |
| Skill invocation names | `.claude/skills/*.md` (filename) | README.md "What's Inside" table | Manual — update README if skills are added/renamed |
| Rarity tiers & config | `app/src/types/equipment.ts` (`RARITY_CONFIG`) | `app/src/engine/loot.ts` (drop rates), `app/src/features/village/Schmiede.tsx` (upgrade table) | Type-safe — `Rarity` union enforces valid keys |
| Equipment slot definitions | `app/src/types/equipment.ts` (`EquipSlot`, `SLOT_LABELS`) | `app/src/stores/equipmentStore.ts` (`equipped` shape) | Type-safe — `EquipSlot` union enforces valid slots |
| Buff stat types | `app/src/types/savings.ts` (`buffStat` union) | `app/src/types/character.ts` (`Buff.stat`), `app/src/engine/buffs.ts` | Type-safe — shared union type, no casts needed |
| BASELINE_RATE | `app/src/stores/savingsStore.ts` (exported const) | `app/src/features/onboarding/OnboardingView.tsx` (imported) | Single source — imported directly, not duplicated |
| localStorage keys | Each store's `persist()` call (`100k-savings-v2`, `100k-character-v1`, `100k-game-v2`, `100k-equipment-v2`, `100k-spells-v1`, `100k-pets-v1`, `100k-mercenaries-v1`) | None | Single source — each key lives only in its store file |
| Token economy (spend/earn) | `app/src/stores/gameStore.ts` (`spendTokens`, `dealDamage`) | Village features (`Taverne.tsx`, `Schmiede.tsx`, `Kaserne.tsx`), `mercenaryStore.ts` | Action-based — all call `spendTokens()`, never mutate directly |
| Game balance constants | `app/src/constants/gameBalances.ts` | Stores + UI that reference caps/limits | Single source — imported, never hardcoded |
| EnemyTrait union | `app/src/types/zone.ts` (`EnemyTrait`) | `app/src/engine/combat.ts` (trait mechanics), `LevelArena.tsx` (trait display) | Manual — if new trait added, combat engine must handle it |
| Trait mechanic constants | `app/src/engine/combat.ts` (`TRAIT_*` exports) | `app/src/stores/gameStore.ts` (shield init), `LevelArena.tsx` (via engine) | Single source — imported from engine/combat.ts |
| Zone IDs | `app/src/data/zones.ts` (zone `id` field) | `equipmentStore.currentZoneId`, `zoneProgress` keys | String-based — validated at zone selection |
| Spell/Pet/Merc IDs | `app/src/data/spells.ts`, `data/pets.ts`, `data/mercenaries.ts` | Respective stores, zone unlock fields | String-based — data files are source of truth |
| Mana resource | `gameStore.mana/maxMana` | `spellStore.castSpell()`, `SpellBar.tsx` | Action-based — `castSpell` calls `gameStore.spendMana()` |
| gameStore fan-in | `gameStore.spendTokens()` / `spendMana()` | `equipmentStore`, `spellStore`, `mercenaryStore` | Cross-store call — 3 stores depend on gameStore actions |

---

## Coding Standards (CRITICAL)

These patterns prevent bugs that occur in every codebase. **Follow them exactly.**

### 1. Simple Solutions Over Complex Ones

**ALWAYS prefer the simpler approach that already works.**

```
BAD:  "Let me add a complex retry mechanism with exponential backoff"
GOOD: "Just make the simple request work first"

BAD:  "Let me create an abstraction layer for this one-time operation"
GOOD: "Three similar lines of code is better than a premature abstraction"
```

If something worked before, check git history before rewriting it.

### 2. Error Messages Must Be Actionable

```
// WRONG — useless error
throw new Error("Something went wrong");

// RIGHT — says what happened, why, and what to do
throw new Error(`Failed to connect to ${url}: ${err.message}. Check if the server is running.`);
```

Every error must say what happened, why, and what the user (or developer) can do about it.

### 3. Don't Create Dead Code

If you replace a function or variable, **remove the old one.** Don't leave commented-out code, unused imports, or variables prefixed with `_` that nothing references. Dead code is a lie about the system.

### 4. Check Git History Before "Fixing"

If something used to work:
```bash
git log --oneline --all | grep -i "relevant-keyword"  # Find when it changed
git show <commit>:path/to/file                         # See old working version
```

Often the fix is reverting to what worked, not adding more code.

### 5. Fix ALL Instances of a Pattern

When you find a bug, **search for the same pattern everywhere**:

```bash
# Found a null check bug? Check ALL similar accesses
grep -rn "\.property" src/

# Found a missing validation? Check ALL endpoints
grep -rn "req.body" src/

# One bug usually means the same mistake exists in 3-5 other places.
```

Fix them all or none. Fixing one creates a false sense of safety.

### 6. No Cross-File String Contracts Without a Shared Source

If two files must agree on a string value, format, or list — there MUST be a single source of truth that both reference. Never rely on comments like "must match foo.ts".

```
BAD:  // File A defines format "user:123", File B parses with regex /user:(\d+)/
      // They will drift. Guaranteed.

GOOD: // shared/formats.ts — single file with builder + parser
      export function buildUserId(id: number) { return `user:${id}`; }
      export function parseUserId(str: string) { return parseInt(str.split(':')[1]); }
```

When you discover a cross-file contract, add it to the Cross-File Contracts table above.

### 7. Set User-Agent for External API Calls

External services block or rate-limit requests without proper User-Agent headers. Always set one.

```
// WRONG — many APIs will reject this
fetch('https://api.example.com/data')

// RIGHT
fetch('https://api.example.com/data', {
  headers: { 'User-Agent': 'MyApp/1.0' }
})
```

### 8. Closed By Default

Security boundaries must default to rejecting everything, not accepting everything.

```
// WRONG — empty allowlist means "allow all" (inverted security model)
if (allowedUsers.length > 0 && !allowedUsers.includes(user)) { reject(); }

// RIGHT — empty allowlist means "allow none" (closed by default)
if (!allowedUsers.includes(user)) { reject(); }
```

This applies to permissions, feature flags, API access, input validation — anything where the safe default is "no." Never make an empty list mean "accept all."

### 9. Dual-Layer Changes Must Update Both Sides

When logic exists in two places (client + server, frontend + backend, two config files), updating one without the other creates a silent bug that passes all obvious checks.

```
// If you add a new "dangerous" operation:
//   1. Add it to the server-side check    ← easy to remember
//   2. Add it to the client-side check    ← easy to forget
//   3. Add it to the cross-file contracts table above

// If validation exists in both API and UI:
//   Update BOTH. Test BOTH. Document the contract.
```

**Rule of thumb:** Before finishing any change, grep for the same constant/string/pattern in other files. If you find it in two places, update both.

### Project-Specific Standards

- Python hooks follow stdlib-only convention — no third-party imports (keeps the kit dependency-free)
- Python imports order: stdlib only, grouped logically (json/sys/os, then subprocess/re)
- Hook scripts must handle stdin JSON gracefully — `try/except` around `json.load(sys.stdin)` with a fallback to `{}`
- Hook scripts must respect timeouts configured in `settings.json` (currently 10s) — use `timeout=5` on subprocess calls to leave headroom
- Markdown files use standard GitHub-Flavored Markdown — no custom extensions

---

## Git Workflow (MANDATORY)

**ALWAYS sync with main before pushing:**
```bash
git fetch origin
git merge origin/main --no-edit
git push -u origin <branch-name>
```

This prevents branches from falling behind and avoids merge conflicts. Never push without fetching first.

**Commit messages** follow conventional style:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code restructuring
- `chore:` Maintenance tasks

Keep the first line under 72 characters, add details in the body if needed.

---

## Common Session Traps

These are documented bugs in Claude's behavior. Each one has caused real damage in real projects. The word "Stop." is a behavioral interrupt — when you catch yourself thinking the quoted phrase, halt and read the correction.

### Trap 1: "Let me optimize this"
**Stop.** Is it slow? Is the user complaining? If not, don't touch it. Premature optimization is the root of all evil.

### Trap 2: "I'll fix this one place"
**Stop.** Search for the same pattern. Fix them all or none. One fix creates a false sense of safety.

### Trap 3: "The error says X, so I'll fix X"
**Stop.** The error might be downstream of the real bug. Trace backwards to the root cause before touching code.

### Trap 4: "I need to rewrite this function"
**Stop.** Check git history. Maybe a past version worked. Maybe revert, not rewrite. `git log` is your friend.

### Trap 5: "While I'm here, I'll also clean up..."
**Stop.** Scope creep is the #1 session killer. Do exactly what was asked. If you see something worth improving, mention it — don't do it. Unasked-for changes waste context, introduce risk, and make PRs harder to review.

### Trap 6: "I'll add this to the validation list"
**Stop.** If validation/security/permissions exist in two places (client + server, two config files, two languages), you MUST update both. Updating one side creates a false sense of safety worse than updating neither. Grep for the same string in other files before calling it done.

### Trap 7: "I'll wrap this in a helper for reuse"
**Stop.** Is it actually used more than once *right now*? If not, inline it. Premature abstraction is worse than duplication — it couples code that shouldn't be coupled and makes future changes harder, not easier. Wait until you have 3 real instances before abstracting.

### Trap 8: "I think the user wants..."
**Stop.** If the request is ambiguous, **ask** — don't infer. The cost of asking one question is near zero. The cost of building the wrong thing is an entire session wasted. Stated intent > inferred intent > assumed intent, always.

### Trap 9: "This looks correct to me"
**Stop.** Sycophancy alert. If you're confirming something looks correct, you need to *prove* it — trace the logic, find a concrete input that exercises the path, verify the output. "Looks correct" without proof is just agreement, not analysis. See `.claude/skills/adversarial-review.md`.

### Project-Specific Traps

### Trap 10: "I'll add a new skill file for this"
**Stop.** Skills should be general-purpose workflows, not task-specific instructions. If the workflow won't be reused across multiple projects, it doesn't belong as a skill. Put task-specific guidance in CLAUDE.md or a DECISION file instead.

### Trap 11: "I'll add a pip dependency to the hooks"
**Stop.** The hooks are stdlib-only Python by design. Adding dependencies breaks the "drop into any repo" promise. If you need functionality beyond stdlib, reconsider the approach.

### Trap 12: "I'll mutate the store directly from a component"
**Stop.** Store mutations must go through named actions (`spendTokens()`, `upgradeItem()`, `dealDamage()`). Direct `setState({...})` from UI components violates Modularity (#1) — the store owns its invariants (e.g., "tokens can't go negative"), and scattering mutations across components makes them impossible to enforce.

### Trap 13: "I'll store the full object for selection state"
**Stop.** Store IDs, not objects. Zustand store data changes on every action — if a component holds a stale object copy (e.g., a `GearItem` before upgrade), it renders outdated stats. Store the `id` string and re-derive the object from current store state each render.

### Trap 14: "I'll add overflow-y-auto to this container"
**Stop.** The app uses a single-scroll architecture — only `<main>` scrolls. Adding `overflow-y-auto` to inner containers creates nested scrollbars that break mobile UX. Let content flow naturally and let the page scroll.

---

## What Each Key File Does

The "Touch carefully" column tells you the blast radius. **Yes** = changes here cascade widely; read the whole file before editing. **Moderate** = self-contained but important. **Usually safe** = low-risk changes.

| File | Purpose | Touch carefully? |
|------|---------|------------------|
| `CLAUDE.md` | Project instructions — universal standards + adaptive sections | Yes — this is the primary contract Claude reads every session |
| `.claude/settings.json` | Registers hooks (SessionStart, Stop) | Yes — wrong config breaks all hooks silently |
| `.claude/hooks/session-start.py` | Auto-orientation at session start | Moderate — changes affect every session's first message |
| `.claude/hooks/maintenance-check.py` | Doc-update reminder before session end | Moderate — can block sessions if misconfigured |
| `docs/PRINCIPLE_LATTICE.md` | 5 axiomatic principles with instantiation slots | Moderate — principles are shared across CLAUDE.md |
| `docs/TASK_CONTRACT_TEMPLATE.md` | Copy-per-task template for acceptance criteria | Usually safe — it's a template, not referenced by code |
| `.claude/skills/*.md` | Skill definitions for Claude workflows | Usually safe — self-contained markdown prompts |
| `.claude/PR_GUIDELINES.md` | PR description format | Usually safe |
| `README.md` | User-facing documentation | Usually safe |
| `app/src/constants/gameBalances.ts` | Single source of truth for game balance numbers | Yes — 6 stores + UI import from here |
| `app/src/engine/*.ts` | Game math — combat, progression, zones, loot, spells, pets, mercs, buffs | Moderate — stores depend on these calculations |
| `app/src/stores/*.ts` | Zustand stores — savings, character, game, equipment, spells, pets, mercenaries | Yes — UI reads from these; actions enforce invariants |
| `app/src/types/*.ts` | Shared types — equipment, character, savings, game, zone, spell, pet, mercenary | Yes — cross-file contract source of truth |
| `app/src/data/*.ts` | Static game content — zones (12), spells (7), pets (5), mercenaries (6) | Moderate — engine and stores reference these |
| `app/src/features/game/*.tsx` | Main game tab — arena, spells, zone map, pets, character panel | Moderate — core gameplay loop |
| `app/src/features/village/*.tsx` | Village tab — Taverne, Schmiede, Kaserne, Akademie | Usually safe — self-contained token-spend features |
| `app/src/App.tsx` | Router + layout + tab navigation + store init | Yes — changes here affect all tabs |

## Current State (Honest Assessment)

### Harness / Kit Components

| Component | Status | Gap |
|-----------|--------|-----|
| CLAUDE.md template | Working | All `[ADAPT]` sections populated; game contracts and traps documented |
| SessionStart hook | Working | Runs, outputs orientation JSON |
| Stop/maintenance hook | Working | Blocks on code changes without doc updates |
| Principle Lattice | Working | Axioms defined; instantiation slots filled with game examples |
| Skills (adversarial-review) | Working | Markdown prompt, no code to break |
| Skills (project-status) | Working | Markdown prompt |
| Skills (research-then-implement) | Working | Markdown prompt |
| Skills (structured-reasoning) | Working | Markdown prompt |
| Task Contract Template | Working | Template only, copied per-task |
| PR Guidelines | Working | Static reference doc |
| Automated tests | MISSING | No test suite — hooks are tested manually |
| CI/CD | MISSING | No pipeline defined |

### Game Application (`app/`)

| Component | Status | Gap |
|-----------|--------|-----|
| Engine: compound interest | Working | `projectBalance()` drives the Recharts curve |
| Engine: progression (level/XP/DPS) | Working | Balance → level, gear-aware DPS/crit |
| Engine: combat | Working | Trait modifiers, crit calculation, extracted from LevelArena |
| Engine: loot system | Working | Zone-scaled drops, 5 rarity tiers, pity counter (15 threshold), boss loot |
| Engine: zones | Working | Encounter generation (shuffle bag), HP/reward scaling, zone unlock checks |
| Engine: spells | Working | Spell effect application, cooldown management |
| Engine: pets | Working | Pet bonus calculation, evolution stage resolution |
| Engine: mercenaries | Working | Party bonus aggregation, merc crit damage rolls |
| Engine: achievements | Working | Achievement condition checking |
| Engine: buffs & milestones | Working | Milestone + product buffs feed into character stats |
| Constants: gameBalances | Working | Single source of truth for inventory cap, mana, spell limits, age/contribution bounds |
| Store: savingsStore | Working | Balance, transactions, products, monthly tick, blended rate |
| Store: characterStore | Working | Level/stats derived from balance + products |
| Store: gameStore | Working | Enemy HP, mana, damage, combat tokens, streaks, spell buffs, `spendTokens()`, `decrementShield()`, `healEnemy()` |
| Store: equipmentStore | Working | Inventory (cap 100), 4 equip slots, zone progress, `upgradeItem()`, prestige reset |
| Store: spellStore | Working | Unlocked/equipped spells (max 3), cooldowns, auto-cast toggle |
| Store: petStore | Working | Pet collection, XP/leveling, equipped pet (1 at a time) |
| Store: mercenaryStore | Working | Recruited mercs, party slots (max 2) |
| Game tab: LevelArena | Working | RAF combat loop, trait engine integration, zone-based spawning, loot notifications |
| Game tab: SpellBar | Working | 3-slot spell bar with cooldown overlay, mana cost feedback |
| Game tab: ZoneMap | Working | Zone selection, progress tracking, star ratings |
| Game tab: PetPanel | Working | Pet display, collection, XP bar |
| Game tab: CharacterPanel | Working | Gear-aware stats, buff display, equipment slots |
| Game tab: CompoundCurve | Working | Recharts area chart with contribution slider |
| Game tab: MicroSaveAction | Working | RPG-themed save buttons trigger balance + character recalc |
| Game tab: MilestoneTrack | Working | Horizontal milestone progress bar |
| Game tab: EquipmentPanel | Working | 4 slot cards + inventory list with rarity colors |
| Game tab: SkipMonthButton | Working | Prestige event: monthly deposit → zone unlock |
| Village tab: VillageView | Working | Building grid with sub-view navigation |
| Village tab: Taverne | Working | 5-token cost, random financial facts, seen/unseen tracking |
| Village tab: Schmiede | Working | Upgrade gear by rarity tier, % success, token cost |
| Village tab: Kaserne | Working | Mercenary recruitment, party management |
| Village tab: Akademie | Working | Wraps VideoFeed with back navigation |
| Portfolio tab | Working | Product cards with buff toggle |
| Onboarding | Working | Setup flow → main app |
| Scroll architecture | Working | Single `<main>` scroll, hidden scrollbars, no nested overflow |
| localStorage persistence | Working | 7 stores persist independently with versioned keys |

## "When Editing X, Check Y" Rules

These conditional rules fire when you're working in specific areas. They prevent the most common cascade failures.

### When editing `.claude/settings.json`:
1. Verify hook script paths still resolve — the `$(git rev-parse --show-toplevel)` pattern must match actual file locations
2. Check that timeout values leave headroom for subprocess calls inside hooks (hook timeout > subprocess timeout)
3. Test the hook by starting/stopping a Claude Code session

### When editing hook scripts (`.claude/hooks/*.py`):
1. Ensure no third-party imports — stdlib only
2. Keep `json.load(sys.stdin)` wrapped in try/except with graceful fallback
3. Verify subprocess calls use `timeout=5` (must be less than the 10s hook timeout in settings.json)
4. If you rename a hook file, update `.claude/settings.json` to match

### When editing the Principles table in CLAUDE.md:
1. Keep it in sync with `docs/PRINCIPLE_LATTICE.md` — same names, same numbers, same axioms
2. These are referenced by number elsewhere (e.g., "violates #1") — renumbering breaks references

### When adding a new skill:
1. Create the `.md` file in `.claude/skills/`
2. Update the "What's Inside" table in `README.md`
3. Add the skill to the "Current State" table in this file

---

## Context Discipline

### Research → Decision → Implement (Two-Phase Pattern)

Complex tasks benefit from separating thinking from doing. When a task requires significant research, exploration, or decision-making:

**Phase 1 — Research (separate session or early in session):**
- Explore options, read code, identify tradeoffs
- Output a concrete decision to a file (e.g., `DECISION.md` or task-specific notes)
- Be specific: "Use JWT + bcrypt-12 + 7-day refresh + HttpOnly cookies" not "implement auth"

**Phase 2 — Implement (fresh context, decision only):**
- Start from the decision file + only relevant source files
- No re-exploring, no second-guessing — just execute the plan

This prevents the #1 agent performance killer: context bloat from mixing research and implementation in one giant session.

### Task Contracts (Explicit Done Conditions)

Before starting complex work, define what "done" looks like. Create a contract file or state it explicitly:

```markdown
## Done when:
- [ ] All existing tests pass
- [ ] New endpoint returns 200 for valid input, 401 for missing token
- [ ] No new TypeScript errors (`npx tsc --noEmit`)
- [ ] Error messages include HTTP status + actionable fix suggestion
```

You may NOT consider a task complete until every condition is verifiably satisfied. If a condition can't be met, explain why and ask for revised acceptance criteria.

See `.claude/skills/adversarial-review.md` for a structured verification pattern.

### Neutral Phrasing for Accurate Analysis

When asking Claude to analyze code, use neutral language to avoid sycophantic confirmation bias:

```
BAD:  "Is there a bug in the auth flow?"         → biases toward finding one
BAD:  "The auth flow looks correct, right?"       → biases toward confirming

GOOD: "Trace the logic of each component in the auth flow and report your
       observations. Do not assume anything is broken unless you can prove it."
```

---

## Scaling Up — When This File Gets Too Long

As your project grows, this CLAUDE.md will accumulate project-specific patterns, traps, and standards. When it exceeds ~300 lines, restructure it into a **router** that conditionally loads separate files:

```markdown
# CLAUDE.md — entry point / router — always read first

Before you do ANYTHING in this codebase, read this file completely.

## Universal rules (always apply)
→ Read docs/RULES_universal.md

## Conditional routing
- If you are writing or changing code       → read docs/RULES_coding.md
- If you are writing tests                  → read docs/RULES_testing.md
- If tests are failing                      → read docs/RULES_debugging.md
- If the task involves frontend / UI        → read docs/SKILLS_ui-patterns.md
- If unsure about anything                  → STOP and ask for clarification
```

**Rules** = preferences and prohibitions (what to do / not do)
**Skills** = battle-tested recipes for recurring problems (how to do it)

The goal: Claude reads only what's relevant to the current task, not the entire project history on every turn.

---

## Before Submitting Changes

1. Did I test the happy path?
2. Did I search for similar patterns to fix? (Coding Standard #5)
3. Did I remove dead code? No commented-out code, no unused variables.
4. Did I check git history for regressions?
5. Is this simpler than what was there before? (If not, justify why complexity is necessary.)
6. If I added a cross-file contract, is there a single source of truth? (Standard #6)
7. If I touched a boundary that exists in two places, did I update BOTH sides? (Standard #9)
8. Did I stay within scope? No unasked-for refactoring, no bonus features. (Trap #5)
9. Are tests still passing?

---

## Session Continuity

When starting a session, look for `SESSION_NOTES.md` in the project root. If it exists, a previous session left continuity notes. Reference them to pick up where the last session left off.

When ending a session (or if the user is wrapping up), update SESSION_NOTES.md:

```markdown
# Session Notes — [date]
## What we worked on
- [brief description]
## Current state
- [what's done, what's in progress]
## Next steps
- [what the next session should pick up]
## Key decisions made
- [any architectural or design decisions]
```

This is the AI equivalent of a sticky note on the monitor. Simple. Effective.
