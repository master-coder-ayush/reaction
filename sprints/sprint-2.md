# Sprint 2 — Dashboard · XP System · Streaks · Reaction of the Day

**Duration**: Week 2  
**Goal**: The dashboard is fully functional for both guests and logged-in users. XP earns, levels update, streaks tick, and the Reaction of the Day card is live.

---

## Tasks

### 2.1 Dashboard Layout (`/`)
- [ ] Single layout works for guest + logged-in — same component, different data shape
- [ ] Guest banner: slim top bar — "You're practicing as a guest — your progress won't be saved. [Sign up free] to keep your XP, earn badges, and join the leaderboard."
  - Always visible, non-blocking, no modal
  - `[Sign up free]` links to `/signup`
  - Hidden once user is logged in
- [ ] Welcome banner (one-time): shown after sign-up redirect — "Welcome to Level Up Chemistry, [Name]! Your [N] guest XP has been saved to your account." — dismissable, disappears on next page load

### 2.2 Dashboard Cards (Logged-In)
- [ ] Streak card: "🔥 [N]-day streak" with sub-text "Complete today's reaction to keep it alive!" (if not done today)
- [ ] XP progress bar: current XP / XP to next level, level name displayed
- [ ] Reaction of the Day card: highlighted with pulsing border, countdown timer to next day's reaction (23:xx:xx)
- [ ] Leaderboard rank chip: "Weekly rank: #5"
- [ ] "Continue where you left off" card → links to next incomplete chapter
- [ ] Session XP counter in nav (shows for guests too, resets per session)

### 2.3 Dashboard Cards (Guest)
- [ ] Session XP counter visible (reads from localStorage)
- [ ] Streak card hidden
- [ ] Leaderboard rank hidden — replaced with "Sign up to appear"
- [ ] All chapter navigation tiles visible and clickable (nothing locked on the UI for guests)

### 2.4 Chapter Map (`/learn`)
- [ ] Class 11 / Class 12 tabs
- [ ] Chapter cards grid: name, progress bar (reactions mastered / total), lock state
- [ ] Chapter 1 always unlocked; subsequent chapters gated behind boss level (logic stubbed — boss system in Sprint 5)
- [ ] Guests see all chapters as accessible (no gate enforced for guests)

### 2.5 XP System
- [ ] `src/lib/xp.ts`: XP award table from PLAN.md (`CORRECT_EASY=10`, `CORRECT_MEDIUM=20`, etc.)
- [ ] `POST /api/xp/award` — updates `user_stats.xp`, recalculates level, returns new XP + level
- [ ] Level thresholds: 0/200/500/1000/2000/4000/8000 — level-up event returned if threshold crossed
- [ ] Guest path: XP written to `localStorage` key `guest_xp` and `guest_xp_log[]` (no API call)
- [ ] Level-up toast/animation when threshold crossed

### 2.6 Streak Logic
- [ ] `src/lib/streak.ts`: `checkAndUpdateStreak(userId)` — called after any reaction is answered
  - If `last_activity_date` is today → no change
  - If yesterday → `streak_current += 1`, update `last_activity_date`
  - If older → check `streak_freeze_count > 0`, consume one freeze; otherwise reset to 1
  - Award streak freeze every 7-day milestone (max 2)
- [ ] Streak milestone badge triggers: 7-day, 30-day, 100-day
- [ ] "Streak lost 😔" state on dashboard if missed + freeze option shown

### 2.7 Reaction of the Day
- [ ] `daily_challenges` table pre-seeded with one reaction per day
- [ ] `GET /api/daily-challenge` — returns today's reaction (by `challenge_date = today`)
- [ ] Double XP flag: if user has not completed today's challenge, award 2× XP on first correct answer; mark complete in `user_progress` with `daily_bonus=true`
- [ ] Countdown timer component: client-side, counts to midnight

---

## Acceptance Criteria

- Guest lands on `/`, sees banner, sees chapter map, sees session XP at 0 in nav
- Logged-in user sees streak, XP bar, Reaction of the Day card, weekly rank
- Completing Reaction of the Day awards double XP and updates streak
- Missing a day: streak shows as broken on next login (or freeze consumed)
- Level-up animation fires when XP threshold is crossed
- Chapter map shows correct lock/unlock state (Sprint 5 adds boss logic; here all unlock stubs work)

---

## Key Files Created / Modified
```
src/app/page.tsx                        Dashboard
src/components/GuestBanner.tsx
src/components/StreakCard.tsx
src/components/XPProgressBar.tsx
src/components/ReactionOfTheDay.tsx
src/components/ChapterMap.tsx
src/components/Countdown.tsx
src/lib/xp.ts
src/lib/streak.ts
src/app/api/xp/award/route.ts
src/app/api/daily-challenge/route.ts
src/app/learn/page.tsx
```

---

## User Journey Coverage
- **Journey 1 (Guest)**: Full guest dashboard — banner, session XP, chapter map, leaderboard read-only row.
- **Journey 2 (Sign-Up)**: Welcome banner post sign-up with transferred XP, redirect to dashboard showing "XP: 320 / 500 to next level."
- **Journey 3 (Returning Student)**: Streak card showing 12-day streak, Reaction of the Day with pulsing border, XP progress bar.
- **Edge case**: Streak breaks — "Streak lost 😔" with freeze option shown.
- **Edge case**: Guest session XP shown in nav from localStorage.
