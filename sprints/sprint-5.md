# Sprint 5 — Boss Levels · Chapter Gating · Escape Room

**Duration**: Week 5  
**Goal**: Boss levels are fully functional with gating, attempt limits, and rewards. Escape Room mode is playable end-to-end.

---

## Tasks

### 5.1 Boss Level System

**Route**: `/boss/[chapter]`

- [ ] Entry screen:
  - Chapter name + "Boss Level"
  - "20 questions · 10 minutes · Need 16/20 to clear"
  - Reward preview: badge name + 200 XP + chapter card
  - "Start Boss Level" button (disabled if attempt limit reached today)
  - "Daily attempt limit reached. Come back tomorrow." if 3 attempts used
- [ ] Boss session:
  - 20 questions drawn from all modules in the chapter (mix of Module 1 MCQ + Module 2 name-reaction)
  - Timer: countdown from 10:00, auto-submit remaining unanswered when timer hits 0
  - No hints during boss level (`hint_panel` hidden, `HintPanel` not rendered)
  - Progress indicator: "Question 7 / 20" + timer visible at all times
- [ ] Results screen (pass — ≥16/20):
  - "✅ Boss Cleared! [N]/20"
  - "+200 XP" award
  - Badge earned — animated badge reveal (reuses `BadgeRevealModal` from Sprint 4)
  - Chapter card added to collection
  - "Carboxylic Acids chapter is now unlocked!" (or whichever next chapter)
  - Redirect to chapter map — next chapter unlocks with animation
- [ ] Results screen (fail — <16/20):
  - "Not quite! You need 16/20."
  - Score shown
  - Weak areas: up to 3 reaction names where student scored 0/correct attempts
  - Two quick-practice shortcut cards for those reactions
  - "Try Again" (if attempts < 3 today) or "Come Back Tomorrow"
- [ ] Attempt tracking: `boss_attempts` column on `user_progress` per chapter per day — checked on entry, incremented on submit

### 5.2 Chapter Gating
- [ ] `src/lib/chapters.ts`: `isChapterUnlocked(userId, chapterId)` — checks `user_badges` for the previous chapter's boss badge (or flag in `user_stats`)
- [ ] Chapter 1 (Hydrocarbons) always unlocked
- [ ] Each subsequent chapter unlocked only if previous chapter's boss badge is earned
- [ ] Chapter map shows lock icon on locked chapters; clicking shows: "Clear the [previous chapter] Boss Level to unlock this chapter"
- [ ] Guests: all chapters accessible — chapter gating not enforced for guests (they cannot persist progress anyway)
- [ ] API guard: `GET /api/reactions?chapter=[id]` checks unlock status for logged-in users

### 5.3 Boss Level Badges
- [ ] Wire up `BOSS_CLEAR` badge event in `badges.ts` — fires after each boss cleared
  - Hydrocarbon Hero, Aldehyde Ace, etc. — each chapter boss has its own badge
- [ ] `BOSS_PERFECT` badge: 20/20 on any boss level
- [ ] Badge reveal shown on results screen

### 5.4 Escape Room Mode

**Route**: `/escape-room`

- [ ] Entry screen: "You are locked in the Organic Chemistry Lab. Solve reactions to unlock each door and escape."
- [ ] Class selector: Class 11 / Class 12
- [ ] Door map: 5 doors shown horizontally, doors 2–5 with padlock icons initially
- [ ] Door session:
  - 5 reactions for the chapter, must solve in sequence
  - Correct → keyhole animation unlocks on that reaction slot
  - Wrong → reaction resets (no penalty, no XP deducted); try again until correct
  - "Need a clue" button: costs 10 XP, shows `why_text` for current reaction
  - After all 5 cleared → door-open animation → next door becomes available
- [ ] Completion screen:
  - "You escaped! Time: [MM:SS]"
  - "+100 XP · Escape Artist badge earned"
  - Escape time saved to user record; shown on Escape Room leaderboard tab
- [ ] Escape Room leaderboard: separate tab on `/leaderboard` — shows username + escape time (fastest first) + date
- [ ] "Escape Artist" badge wired to completion event

### 5.5 Escape Room Leaderboard Tab
- [ ] Add "Escape Room" tab to `/leaderboard`
- [ ] `GET /api/leaderboard?period=escape` — returns top 20 escape times + user's own best time

---

## Acceptance Criteria

- Boss level loads 20 questions, timer counts down, auto-submits at 0
- Hints are not shown during boss level
- Pass: badge awarded, 200 XP added, chapter card unlocked, next chapter unlocked on map
- Fail: weak areas shown, quick-practice shortcuts offered
- 3 attempts in one day: "Daily attempt limit reached" on entry
- Chapter gating: logged-in users cannot access chapter 2 content without chapter 1 boss cleared
- Guests can access all chapters freely
- Escape Room: 5 doors, retry-until-correct, clue costs 10 XP, completion saves time
- Escape Room leaderboard shows ranked escape times

---

## Key Files Created / Modified
```
src/app/boss/[chapter]/page.tsx
src/components/BossTimer.tsx
src/components/BossResults.tsx
src/components/WeakAreaCards.tsx
src/app/escape-room/page.tsx
src/components/EscapeRoomDoorMap.tsx
src/components/EscapeRoomSession.tsx
src/lib/chapters.ts
src/app/api/boss/submit/route.ts
src/app/api/boss/attempts/route.ts
src/app/api/escape-room/complete/route.ts
```

---

## User Journey Coverage
- **Journey 4 (Boss Level Attempt)**: Karan, 17/20, badge reveal, "Carboxylic Acids unlocked!" on map.
- **Journey 5 (Escape Room)**: Sneha, 5 doors, "Need a clue" costing 10 XP, "You escaped! Time: 18:42", Escape Artist badge.
- **Journey 11 (Boss Level Fail)**: Rohan, 11/20, weak areas (Ozonolysis + Markovnikov), quick-practice cards shown.
- **Edge case**: 3 attempts in one day → "Daily attempt limit reached."
- **Edge case**: Boss cleared 100% → Perfect Boss badge.
