# Implementation Plan — Kampf Tab & Game Systems Overhaul

## Root Cause Analysis

The user's requests trace back to **3 root causes**:

1. **Broken progression flow**: Spells/pets/mercs only unlock during prestige (SkipMonthButton), NOT when boss is killed. New players clear zone-0 but see nothing unlock until they manually prestige. Auto-equip is missing entirely.

2. **Missing onboarding depth**: No gender selection → no character identity → no narrative hook for first mercenary. Zone-0 is bare — gives only 1 spell, no pet, no merc.

3. **Static party system**: Fixed 2 slots, no visual party roster in Kampf tab, Kaserne gated behind zone-1 clear.

---

## Implementation Order (dependency-sorted)

### Step 1: Fix Spell/Pet/Merc Unlock Flow (Critical Bug)
**Files:** `LevelArena.tsx`, `spellStore.ts`

- Unlock spells/pets/mercs immediately when zone boss is killed (not only during prestige)
- Auto-equip first unlocked spell into an empty slot
- Auto-equip first unlocked pet
- This alone fixes "mana/spells not working" — spells will actually appear in the SpellBar

### Step 2: Gender Selection in Onboarding
**Files:** `savingsStore.ts`, `characterStore.ts`, `OnboardingView.tsx`, `CharacterPanel.tsx`, `LevelArena.tsx`

- Add `gender: 'male' | 'female'` to savingsStore (persisted)
- New onboarding step 0.5: gender picker before age
- Male = "Sparritter" 🧙 / Female = "Sparmagierin" 🧙‍♀️
- CharacterPanel + LevelArena use gender for emoji/name
- The unchosen gender becomes the first recruitable mercenary (zone-0)

### Step 3: Zone-0 Minimum Features (Starter Content)
**Files:** `data/zones.ts`, `data/pets.ts`, `data/mercenaries.ts`

- Add starter pet to zone-0: "Spardose" (piggy bank) 🐖 — +5% gold find
- Add starter merc to zone-0: the unchosen gender character
  - Male unchosen → "Sparritter" merc (baseDPS 5, +10% flat DPS)
  - Female unchosen → "Sparmagierin" merc (baseDPS 5, +1 mana regen)
- Zone-0 already has spellUnlock: 'zins-blitz' ✓
- Result: clearing zone-0 gives 1 spell + 1 pet + 1 merc (one of each)

### Step 4: Kaserne Always Available, Progressive Merc Unlocks
**Files:** `data/mercenaries.ts`, `Kaserne.tsx`

- Change Kaserne unlock condition: always show all mercs, locked ones show which zone to clear
- First merc (gender-based) available at zone-0 clear
- Existing mercs keep their zone unlock requirements
- Remove the `isZoneUnlocked(month)` check — only require `zoneProgress[zone].cleared`

### Step 5: Boss HP Normalization (10x Normal Mobs)
**Files:** `data/zones.ts`

- Set ALL boss hpMultipliers to exactly 10.0 (currently ranges 6.0-15.0)
- Normal mobs stay at their current 0.7-1.5 range
- This gives a consistent, predictable boss difficulty spike

### Step 6: Party Display in Kampf Tab
**Files:** `CharacterPanel.tsx`

- Add "Gruppe" section below character stats
- Show each party slot as: emoji + name + DPS
- Empty slots show "Leer" with a hint to visit Kaserne
- Use the same compact card style as the Kaserne party slots

### Step 7: Party Slot Expansion (3rd + 4th Slots)
**Files:** `mercenaryStore.ts`, `Kaserne.tsx`, `constants/gameBalances.ts`, `savingsStore.ts`

- Change partySlots from fixed tuple to dynamic array (max 4)
- Start with 2 slots (default)
- 3rd slot: unlocks when zone-2 is cleared (free)
- 4th slot: unlocks when zone-4 is cleared AND player does a €5 micro-investment
- Add `partySlotsBought: number` to savingsStore to track purchased slots
- Kaserne shows locked slots with unlock conditions

---

## Cross-File Contracts (New)

| Contract | Source | Mirror | Method |
|----------|--------|--------|--------|
| Gender selection | `savingsStore.gender` | `characterStore` (name/emoji), `data/mercenaries.ts` (starter merc) | Single source — gender stored in savingsStore |
| Starter merc ID | Dynamic based on gender | `mercenaryStore`, `Kaserne.tsx` | Computed — `getStarterMerc(gender)` |
| Party slot count | `mercenaryStore.partySlots.length` | `Kaserne.tsx`, `CharacterPanel.tsx` | Action-based — `unlockPartySlot()` |
| Boss HP multiplier | `data/zones.ts` (boss hpMultiplier = 10.0) | `engine/zones.ts` (getZoneEnemyHP) | Single source — data defines, engine computes |

---

## What This Does NOT Change

- No changes to the compound curve, milestone track, or portfolio systems
- No changes to the loot/equipment system
- No changes to the hook scripts or CLAUDE.md structure
- Village buildings (Taverne, Schmiede, Akademie) unchanged
