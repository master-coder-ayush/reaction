# Sprint 8 — Public Profiles · Reference Charts · Full Content Entry · Polish

**Duration**: Week 8  
**Goal**: The app is complete and launch-ready. All content is seeded, public profiles work with sharing, reference charts are live, and all edge cases are handled.

---

## Tasks

### 8.1 Public Profile Page

**Route**: `/u/[username]`

- [ ] Profile data fetched: avatar (initials + color from username hash), level name, XP, streak (current + longest), accuracy %, class level, badges grid, reaction cards count, member since date
- [ ] Badges grid: earned shown in color with date, unearned shown grayed out with requirement text (same as `/badges` but filtered to this user)
- [ ] Reaction cards: "34 / 120 collected" counter + 5 most recently unlocked as showcase
- [ ] Privacy handling:
  - If `is_public = false` → show "This profile is private." — no other data
  - If `is_public = true` → full profile visible to anyone (including guests)
- [ ] Banner at bottom for unauthenticated visitors: "Create your own profile free at Level Up Chemistry."
- [ ] "Copy Profile Link" button: copies `levelupchemistry.in/u/[username]` to clipboard
- [ ] Own profile: shows "Edit Profile" and "Settings" links

### 8.2 Settings Page

**Route**: `/settings`

- [ ] Sections: Account (name, email, phone — editable), Privacy (public/private toggle), Password change
- [ ] Privacy toggle: "Public Profile: ON / OFF" — live preview link to `/u/[username]` when toggled ON
- [ ] `PATCH /api/user/settings` updates `users.is_public`, name, phone
- [ ] Password change: current password verification → bcrypt compare → update hash
- [ ] Account deletion: "Delete account" — confirmation modal, deletes all user data

### 8.3 Reagent Classification Reference

**Route**: `/reference`

- [ ] Full reference page: organized sections
  - Oxidizing Agents: KMnO₄, K₂Cr₂O₇, O₃, CrO₃, PCC (mild)
  - Reducing Agents: LiAlH₄, NaBH₄, H₂/Ni, H₂/Pd
  - Halogenating Agents: Cl₂, Br₂, SOCl₂, PCl₅, PBr₃
  - Bases: KOH (aq) = nucleophilic sub, KOH (alc) = elimination
  - Nucleophiles: OH⁻, CN⁻, NH₃, RO⁻
  - Electrophiles: H⁺, Br⁺, NO₂⁺, SO₃
- [ ] Color-coded by reaction type
- [ ] Searchable / filterable
- [ ] Available to guests

### 8.4 In-Question Reference Drawer (Journey 10)
- [ ] "Reference" book icon in the question card corner (all modules)
- [ ] Tapping opens a side drawer without closing/pausing the question
- [ ] Drawer shows reagent classification reference (subset relevant to current chapter)
- [ ] Reference usage tracked in `user_progress` (no XP deduction, just logged for user awareness)
- [ ] `GET /api/reference/chapter/[id]` returns filtered reference for that chapter

### 8.5 Functional Group Conversion Charts
- [ ] Per-chapter conversion chart: table of From → Reagent → To, color-coded by reaction type
- [ ] Accessible from chapter overview page as "Study Aid" before entering practice
- [ ] Printable/clean layout (no nav, minimal chrome) on `/learn/[chapter]/chart`

### 8.6 Full Content Entry
- [ ] Seed all NCERT + ICSE Class 11 reactions for all 5 chapters
  - Minimum coverage: 10–15 reactions per chapter
  - Each reaction: `question_text`, `equation_text`, 4 options, `hint_wrong_reagent`, `story_text`, `why_text`
- [ ] All 18 named reactions with complete `story_text` and `why_text`
- [ ] All pathway data: at least 3 pathways per chapter
- [ ] All reaction tree data: node + edge definitions for all 5 chapters
- [ ] Daily challenge schedule: pre-populate `daily_challenges` for 30 days from launch
- [ ] Final reaction count targeting ~60–80 reactions for launch (120 is full scope)

### 8.7 Streak Freeze UI
- [ ] Dashboard: when streak is at risk (user has not practiced today and it is after 6 PM), show "Your streak ends at midnight" warning
- [ ] "Use Streak Freeze" button: visible when `streak_freeze_count > 0`; confirms with modal; calls `POST /api/streak/freeze`
- [ ] Streak freeze earned: shown as notification when 7-day milestone hit ("You earned a streak freeze!")

### 8.8 Polish & Edge Cases
- [ ] Guest visits `/settings` → redirect to `/login` with message "Sign in to access your profile."
- [ ] Guest visits `/u/[username]` (own) → redirect to `/login`
- [ ] Guest earns badge condition locally → badge shown as "earned in session" but grayed: "Sign up to keep this badge"
- [ ] Boss attempt limit: "Daily attempt limit reached. Come back tomorrow." — enforced on API + UI
- [ ] "No reactions left in chapter" empty state → "You've practiced all reactions! Try the boss level."
- [ ] Guest closes tab (localStorage lost) → no recovery, consistent with banner copy
- [ ] Guest signs up from different device → 0 XP to transfer shown on sign-up (expected)
- [ ] Responsive design pass: test all pages on 375px (iPhone SE) and 768px (iPad)
- [ ] Loading skeletons for all data-fetching states
- [ ] Error boundary on question card (if reaction data fails to load)

### 8.9 SEO & Meta
- [ ] `metadata` on key pages: title + description
- [ ] `/u/[username]` open graph: "Check out [Name]'s chemistry progress on Level Up Chemistry"
- [ ] favicon + manifest for PWA basics

### 8.10 Pre-Launch Checklist
- [ ] All environment variables set in Vercel production
- [ ] Neon DB connection pooling configured
- [ ] Vercel deployment tested: `npm run build` passes
- [ ] Auth callback URLs set for production domain
- [ ] Rate limiting on `/api/signup`, `/api/login` (simple in-memory or Vercel KV)
- [ ] Manual test of all 11 user journeys on production URL

---

## Acceptance Criteria

- Public profile shows correct data; private profile shows "This profile is private"
- "Copy Profile Link" works; unauthenticated visitor sees profile + "Create your own profile" banner
- Reference drawer opens mid-question without losing question state
- All 5 chapters have ≥10 reactions seeded with full hint/story data
- Streak freeze UI visible when freeze is available; correctly consumed on use
- All edge cases from USER_JOURNEYS.md Edge Cases table handled
- `npm run build` passes, app deploys to Vercel without errors

---

## Key Files Created / Modified
```
src/app/u/[username]/page.tsx
src/app/settings/page.tsx
src/app/reference/page.tsx
src/components/ReferenceDrawer.tsx
src/components/ConversionChart.tsx
src/app/learn/[chapter]/chart/page.tsx
src/app/api/user/settings/route.ts
src/app/api/reference/chapter/[id]/route.ts
src/app/api/streak/freeze/route.ts
scripts/seed-all-reactions.ts
scripts/seed-daily-challenges.ts
```

---

## User Journey Coverage
- **Journey 7 (Public Profile + Sharing)**: Riya's profile at `/u/riya_organic`, privacy toggle, "Copy Profile Link", friend visits and sees "Create your own profile" banner.
- **Journey 10 (Reference Charts)**: Nisha, mid-question reference drawer, KMnO₄ vs PCC distinction, drawer closes, correct answer picked.
- **Edge case — Streak lost**: dashboard shows "Streak lost 😔", streak freeze option.
- **Edge case — Profile private**: `/u/[username]` shows "This profile is private."
- **Edge case — Guest at `/settings`**: redirect to `/login` with message.
- **Edge case — Guest badge**: shown grayed with "Sign up to keep this badge."
