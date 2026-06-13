# Sprint 7 — Module 3 (Drag & Drop) · Module 5 (Timed Challenge) · Reaction Cards

**Duration**: Week 7  
**Goal**: The two remaining practice modules are live. Reaction card collection is fully wired and viewable.

---

## Tasks

### 7.1 Module 3 — Drag and Drop Mechanism

**Route**: `/practice/[chapter]/module-3`

- [ ] Mechanism diagram: static SVG or image per reaction showing the reaction structure with blank label slots
- [ ] Label tray: 4–5 draggable label chips at the bottom (Electrophilic Carbon, Nucleophile, Leaving Group, New Bond, Bond Breaks)
- [ ] Drag behavior (dnd-kit):
  - Drag label from tray → drop onto a target slot
  - Slot highlights on hover
  - Only one label per slot; label returns to tray if dropped on occupied slot
  - Mobile: tap-to-select + tap-slot-to-place fallback (dnd-kit touch sensor)
- [ ] Validation on "Submit":
  - All slots must be filled before submit is enabled
  - All correct → confetti + "+30 XP" + `story_text` shown
  - Any wrong → wrong slots flash red, wrong labels snap back to tray; student fixes and retries
  - After 3 failed attempts on same question → show answer with explanation (no XP awarded)
- [ ] Available mechanisms: SN1, SN2, E2, Electrophilic Addition (4 mechanism types, at least 1 question each)
- [ ] Pure client-side evaluation (no API call to validate — answers stored in DB, compared on client)
- [ ] `POST /api/progress` records pass/fail per mechanism reaction

### 7.2 Module 5 — Timed Challenge (60-Second Mode)

**Route**: `/timed`

- [ ] Entry screen: "60-Second Challenge — How many reactions can you name in 60 seconds?"
- [ ] Start countdown: 3… 2… 1… Go!
- [ ] Session:
  - Timer bar at top, depleting over 60 seconds
  - Reactions appear one by one (Module 1 or Module 2 format, random)
  - Student taps correct option — next reaction loads instantly (no transition delay)
  - Wrong answer: flash red, same reaction stays — student must pick correct to advance
  - Timer runs to 0 regardless of answer state; current question is abandoned
- [ ] End screen:
  - "You answered [N] reactions correctly in 60 seconds!"
  - XP: `N × 15`
  - Previous best shown: "Your best: [M]"
  - "Speed Demon" badge if N ≥ 10 (first time)
  - Score posted to speed leaderboard (logged-in users only)
- [ ] Speed leaderboard: separate tab on `/leaderboard` — columns: Rank, Username, Best Score, Date
- [ ] `POST /api/timed/submit` — saves score, updates best, returns badge info

### 7.3 Speed Demon Badge
- [ ] Wire `TIMED_10_CORRECT` event → `badges.ts` → awarded when `best_timed_score >= 10`
- [ ] Badge reveal animation shown on end screen

### 7.4 Reaction Card Collection

**Route**: `/cards`

- [ ] Grid of all reactions in the game (120 total at full content)
- [ ] Unlocked cards: shown in full color
  - Card face: reaction name, difficulty (⭐–⭐⭐⭐), reactant → reagent → product, reaction type color border, "Unlocked [date]"
- [ ] Locked cards: shown as dark silhouette / question mark
- [ ] Progress counter: "42 / 120 cards collected"
- [ ] Filter: by chapter / by reaction type / unlocked only
- [ ] Pathway cards (from Module 4): shown in a separate "Pathway Cards" section
- [ ] Card unlock animation: when a new card is unlocked mid-session, show a brief "card flip" animation before showing the full card
- [ ] Guest view: session-earned cards shown with "Sign up to keep these cards" watermark — not persisted

### 7.5 Card Collector Badge
- [ ] Wire `CARDS_25` event → `badges.ts` → awarded when `unlocked_cards_count >= 25`
- [ ] Wire `CARDS_ALL` (Reaction Ninja) → when all cards unlocked

---

## Acceptance Criteria

- Drag & Drop: labels drag from tray to slots, wrong placements snap back, correct answer shows story text
- Module 3 works on mobile (tap-to-select)
- Timed Challenge: 60-second countdown, reactions advance on correct answer, score saved to leaderboard
- Speed Demon badge fires at 10 correct in one session
- `/cards` shows correct unlock state for the logged-in user
- Card count shown correctly on profile and `/cards`
- Guest card collection shown with "sign up" watermark

---

## Key Files Created / Modified
```
src/app/practice/[chapter]/module-3/page.tsx
src/components/MechanismDiagram.tsx
src/components/DraggableLabel.tsx
src/components/LabelSlot.tsx
src/app/timed/page.tsx
src/components/TimedSession.tsx
src/components/TimerBar.tsx
src/app/cards/page.tsx
src/components/ReactionCard.tsx
src/components/CardGrid.tsx
src/app/api/timed/submit/route.ts
src/app/api/cards/route.ts
```

---

## User Journey Coverage
- **Journey 8 (Drag & Drop Mechanism)**: Amit, SN2 labels, all correct → confetti + story text; SN1 wrong drag → snap back, gentle red border.
- **Journey 3 (Timed Challenge)**: Priya, 60-second mode, 7 correct, leaderboard rank updates to #4.
- **Journey 3 (Session Summary — Reaction Card)**: "Wurtz Reaction card added to collection" shown in session summary.
- **Edge case**: Guest earns a badge condition locally → badge shown as "earned in session" but grayed "Sign up to keep this badge."
