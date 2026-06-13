# Sprint 4 — Module 2 (Name the Reaction) · Leaderboard · Badges

**Duration**: Week 4  
**Goal**: Module 2 (named reactions) is playable. Leaderboard is live with all tabs and filters. Badge system is wired up and awards automatically.

---

## Tasks

### 4.1 Module 2 — Name the Reaction

**Route**: `/practice/[chapter]/module-2`

- [ ] Question card shows: full reaction equation (reactant + reagent → product)
- [ ] 4-option MCQ: pick the correct reaction name (e.g., Esterification, Cannizzaro, Wurtz)
- [ ] Only reactions where `is_name_reaction = true` are shown in Module 2
- [ ] Correct flow: confetti, "+20 XP", `story_text` slides in
- [ ] Wrong flow: correct name revealed, `story_text` + `why_text` shown
- [ ] Shares `QuestionCard`, `HintPanel`, `SessionSummary` from Sprint 3 — just different data shape
- [ ] Content: enter all 18 named reactions from PLAN.md with `story_text` and `why_text`

### 4.2 Leaderboard (`/leaderboard`)

**Route**: `/leaderboard`

- [ ] Tabs: Daily / Weekly / Monthly / All-Time (default: Weekly)
- [ ] Filter chips: All / Class 11 / Class 12
- [ ] Table columns: Rank · Avatar (initials) · Username · Level name · XP · Streak
- [ ] Medal icons: 🥇 🥈 🥉 for top 3 rows
- [ ] Logged-in user's own row: always pinned at the bottom of the visible list, highlighted in a different background color, shown even if outside top 10
- [ ] Guest view: table is fully visible; own row shows "Sign up to appear on the leaderboard" — no rank, no XP
- [ ] `GET /api/leaderboard?period=weekly&class=all` returns top 50 + caller's own row
- [ ] Leaderboard snapshots strategy: `leaderboard_snapshots` table updated by a lightweight cron approach — on each `xp/award` call, upsert the user's row in the weekly snapshot

### 4.3 Badge System

- [ ] `src/lib/badges.ts`: `checkAndAwardBadges(userId, event)` — called after XP award, streak update, boss clear, etc.
- [ ] Event types: `FIRST_REACTION`, `STREAK_7`, `STREAK_30`, `STREAK_100`, `CORRECT_STREAK_3`, `BOSS_CLEAR`, `BOSS_PERFECT`, `TIMED_10_CORRECT`, `PATHWAY_FIRST`, `CARDS_25`, `CARDS_ALL`, `LEVEL_7`
- [ ] When a badge is newly earned:
  - Insert into `user_badges`
  - Return badge data to the client
  - Show badge earned toast/modal (animated badge reveal, like Journey 4 Boss results)
- [ ] `/badges` page: grid of all 12 badges — earned shown in color with date, unearned shown grayed out with requirement text
- [ ] Guest view of `/badges`: all badges shown as locked with "Sign up to earn badges"

### 4.4 Badge Triggers Wired Up (this sprint)
- [ ] `First Reaction` — after first `user_progress` insert with `correct_count = 1`
- [ ] `On a Roll` — after 3 consecutive correct answers in a session (tracked in session state)
- [ ] `7-Day Streak` / `30-Day Streak` / `100-Day Streak` — inside `streak.ts` milestone check
- [ ] Remaining badges triggered in later sprints (Boss, Pathway, Timed, Cards)

### 4.5 Leaderboard Widget on Dashboard
- [ ] Dashboard leaderboard section: shows top 3 weekly + user's own row
- [ ] "View full leaderboard →" link
- [ ] Guest row: "Sign up to appear on the leaderboard" as last row

---

## Acceptance Criteria

- Module 2 questions show full equation, 4 named reaction options
- All 18 named reactions have `story_text` and `why_text` in DB
- Leaderboard loads with correct data for daily/weekly/monthly/all-time tabs
- Class filter works correctly
- Logged-in user's row is pinned at bottom even when outside top 10
- Guest sees leaderboard but no personal rank
- Badge awarded immediately after trigger event; animated reveal shown
- `/badges` shows correct earned/locked state per user

---

## Key Files Created / Modified
```
src/app/practice/[chapter]/module-2/page.tsx
src/app/leaderboard/page.tsx
src/components/LeaderboardTable.tsx
src/components/BadgeGrid.tsx
src/components/BadgeRevealModal.tsx
src/app/badges/page.tsx
src/app/api/leaderboard/route.ts
src/app/api/badges/check/route.ts
src/lib/badges.ts
scripts/seed-named-reactions.ts
```

---

## User Journey Coverage
- **Journey 3 (Leaderboard Check)**: Priya sees herself at #3 weekly, Rohan at #1, 110 XP gap — drives her to do timed challenge.
- **Journey 4 (Boss Results)**: Badge reveal animation (tested here with manual trigger; Boss module in Sprint 5).
- **Journey 9 (Leaderboard Competition)**: All three friends visible, weekly XP tab, class filter.
- **Edge case**: Guest opens leaderboard — sees full table, own row shows "Sign up to appear."
