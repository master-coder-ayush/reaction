# Level Up Chemistry — Project Plan

## Vision

A Duolingo-style organic chemistry learning platform for Class 11 and 12 students (NCERT, CBSE, ICSE). Students practice reactions through interactive challenges, earn XP, maintain streaks, collect reaction cards, and compete on leaderboards — turning rote memorization into pattern-based game learning.

---

## Tech Stack

| Layer         | Tool                                      |
|---------------|-------------------------------------------|
| Frontend + API | Next.js 14 (App Router, TypeScript)      |
| Styling       | Tailwind CSS + shadcn/ui                  |
| Animations    | Framer Motion                             |
| Database      | Neon PostgreSQL (serverless)              |
| ORM           | Drizzle ORM                               |
| Auth          | NextAuth.js v5                            |
| Drag & Drop   | dnd-kit (client-side only)               |
| Hosting       | Vercel (free tier)                        |

No separate backend server. All API logic lives in Next.js route handlers. Neon's serverless driver is compatible with Vercel's edge runtime.

---

## Color Coding (Used App-Wide)

Consistent visual language across every question card, badge, tree node, and chart:

| Reaction Type       | Color  |
|---------------------|--------|
| Oxidation           | Red    |
| Reduction           | Green  |
| Addition            | Blue   |
| Elimination         | Orange |
| Substitution        | Purple |
| Nucleophilic        | Teal   |
| Electrophilic       | Yellow |

---

## Database Schema

### users
```
id, name, username, email, phone, password_hash,
is_public (bool), class_level (11/12/both),
created_at, updated_at
```

### user_stats
```
user_id, xp, level, streak_current, streak_longest,
streak_freeze_count, last_activity_date,
total_correct, total_attempts
```

### categories
```
id, name, class_level, description, order_index
```
Examples: Hydrocarbons, Haloalkanes, Alcohols, Aldehydes & Ketones, Amines

### reaction_types
```
id, name, color, description
```
Examples: Addition, Substitution, Elimination, Oxidation, Reduction

### reactions
```
id, name, category_id, reaction_type_id,
board (NCERT/ICSE/Both), class_level,
difficulty (1-3), question_text, equation_text,
hint_wrong_reagent, hint_wrong_product,
hint_wrong_reactant, story_text, why_text,
is_name_reaction (bool), name_reaction_label,
created_at
```

### reaction_options
```
id, reaction_id, option_type (reactant/reagent/product/name),
text, is_correct, display_order
```

### reaction_pathways
```
id, name, class_level, category_id, description
```

### pathway_steps
```
id, pathway_id, step_order, compound_name,
reagent_used, reaction_type_id
```

### user_progress
```
user_id, reaction_id, attempts, correct_count,
last_attempted, mastered (bool)
```

### badges
```
id, name, description, icon, requirement_type,
requirement_value, color
```

### user_badges
```
user_id, badge_id, earned_at
```

### reaction_cards
```
user_id, reaction_id, unlocked_at
```

### daily_challenges
```
id, reaction_id, challenge_date (unique per day)
```

### leaderboard_snapshots
```
user_id, xp, period_type (daily/weekly/monthly),
period_key, rank, updated_at
```

---

## Features

### 1. Authentication & Profiles

- Sign up: name, username, email, phone number, password
- Login with email or username
- Public profile at `/u/[username]`:
  - XP and current level
  - Current and longest streak
  - Badges earned (grid)
  - Reaction cards collected (count + showcase)
  - Accuracy percentage
  - Class level (11 / 12)
- Privacy toggle: make profile public or private
- Shareable profile link

---

### 2. Guest Access (Open by Default)

The homepage **is** the dashboard. There is no separate marketing/landing page. Every visitor — logged in or not — lands directly on the full dashboard and can use everything immediately.

**What guests can do (everything):**
- Access all chapters, all modules, all practice reactions
- Use Visual Reaction Trees and Conversion Charts
- Attempt Boss Levels and Timed Challenges
- Use the Drag & Drop Mechanism module
- View the Leaderboard (read-only)
- Receive XP and see reaction explanations/hints

**How guest state is stored:**
- All guest progress (XP earned, reactions completed, correct/wrong answers, session accuracy) is stored in `localStorage` — never in the database
- Guest sees their live session XP and a local accuracy count but no streak (streaks require a logged-in account across days)
- Leaderboard is visible to guests but they cannot appear on it without an account

**Persistent sign-up reminder banner:**
- A slim banner sticks to the top of every page for guests:
  > "You're practicing as a guest — your progress won't be saved. [Sign up free] to keep your XP, earn badges, and join the leaderboard."
- Banner is always visible but not intrusive. It does not block any interaction.
- No forced prompts, no modals, no reaction limits.

**On sign-up:**
- All XP accumulated in the guest session is transferred from `localStorage` and credited to the new account immediately
- Reactions attempted in the guest session are marked in `user_progress` so the student doesn't repeat them unnecessarily
- Guest `localStorage` is cleared after successful migration

---

### 3. Five Practice Modules

#### Module 1 — Build the Reaction (MCQ)
Conversion goal shown (e.g., "Convert Ethanol → Ethanoic Acid"). Student selects:
- Correct reactant from 4 options
- Correct reagent from 4 options
- Correct product from 4 options

Each wrong pick shows the stored `hint_wrong_*` text explaining why that choice is incorrect. All three correct = full XP. Partial credit for partially correct.

#### Module 2 — Name the Reaction
Full reaction equation is displayed. Student picks the correct reaction name from 4 options. Wrong answer reveals `story_text` (the narrative version) and `why_text` (the mechanistic reason). Used for all named reactions: Wurtz, Cannizzaro, Aldol, Sandmeyer, Friedel-Crafts, etc.

#### Module 3 — Drag and Drop Mechanism
Student drags labels (Electrophile, Nucleophile, Leaving Group, Bond forms, Bond breaks) onto the correct positions in a reaction diagram. Pure client-side evaluation. Pass/fail stored to `user_progress`. Available for key mechanisms: SN1, SN2, E2, Electrophilic Addition.

#### Module 4 — Reaction Pathway Challenge
Multi-step conversion challenge: "Convert Methane → Ethanol in steps." Student picks each intermediate compound from options in sequence. Each correct step awards XP. Final completion awards bonus XP and unlocks a pathway card. Chains stored in `pathway_steps`.

#### Module 5 — Timed Challenge
60-second burst mode. Reactions appear one after another. Student picks the correct answer as fast as possible. Score (number correct in 60s) saved separately for the speed leaderboard. Great for pre-exam revision.

---

### 4. Learning Content

#### Visual Reaction Trees
Interactive flowchart per compound family stored as node-edge data in the DB. Each node is a compound. Each edge is a reagent. Clicking a node opens its associated reactions for practice.

Example tree:
```
Alkane
  └─(Halogenation/Cl₂,hv)→ Haloalkane
       └─(KOH aq)→ Alcohol
            ├─(PCC)→ Aldehyde
            │    └─(KMnO₄)→ Carboxylic Acid
            └─(H₂SO₄, heat)→ Alkene
```

#### Functional Group Conversion Charts
One reference table per chapter showing: From → To → Reagent. Color-coded by reaction type. Available as a study aid before entering practice mode. Students can bookmark specific conversions.

#### Reaction of the Day
One featured reaction every morning (stored in `daily_challenges`). Shown on the dashboard with a timer counting down to the next one. First attempt of the day awards double XP. Students who complete it maintain their streak.

---

### 5. Progression System

#### XP Awards
| Action | XP |
|---|---|
| Correct answer (easy) | +10 |
| Correct answer (medium) | +20 |
| Correct answer (hard) | +30 |
| Reaction of the Day (first attempt) | +50 |
| Boss Level cleared | +200 |
| Pathway challenge completed | +80 |
| Timed challenge (per correct) | +15 |

#### Levels
| Level | XP Required | Title |
|---|---|---|
| 1 | 0 | Organic Beginner |
| 2 | 200 | Reaction Rookie |
| 3 | 500 | Hydrocarbon Hero |
| 4 | 1000 | Aldehyde Ace |
| 5 | 2000 | Conversion King |
| 6 | 4000 | Reaction Ninja |
| 7 | 8000 | Organic Grandmaster |

#### Streaks
- Streak increments when student completes at least 1 reaction per calendar day
- Streak resets to 0 if a day is missed (unless a streak freeze is used)
- Streak freeze earned every 7-day streak milestone; max 2 held at a time
- Streak milestones: 7 days, 30 days, 100 days

---

### 6. Chapter Structure & Boss Levels

Chapters are gated. A chapter unlocks only after the previous chapter's boss is cleared.

**Class 11 Chapters (NCERT + ICSE)**
1. Hydrocarbons (Alkanes, Alkenes, Alkynes, Benzene)
2. Haloalkanes and Haloarenes
3. Alcohols, Phenols, and Ethers
4. Aldehydes and Ketones *(unlocked after Ch 3 boss)*
5. Carboxylic Acids *(unlocked after Ch 4 boss)*

**Class 12 Chapters**
6. Amines *(unlocked after Ch 5 boss)*
7. Biomolecules (recognition reactions)
8. Named Reactions Master Class *(unlocked after all chapters)*

**Boss Level Format**
- 20 mixed questions from the chapter
- Timer: 10 minutes
- Need 80% (16/20) to clear
- 3 attempts per day
- Reward: Chapter badge + 200 XP + chapter card unlocked

---

### 7. Organic Escape Room Mode

Chapter-gated progression presented as unlocking rooms. Each "room" is a chapter. The door shows a padlock icon until prerequisites are cleared. Inside the room, students must solve reactions to unlock the next section. Framing: you are trapped and reactions are the keys.

---

### 8. Achievements & Badges

| Badge | Trigger |
|---|---|
| First Reaction | Complete 1 reaction |
| On a Roll | 3 correct in a row |
| 7-Day Streak | Maintain streak for 7 days |
| 30-Day Streak | Maintain streak for 30 days |
| 100-Day Master | Maintain streak for 100 days |
| Hydrocarbon Hero | Clear Hydrocarbons boss |
| Speed Demon | Score 10+ in a timed challenge |
| Pathway Pioneer | Complete first pathway challenge |
| Card Collector | Unlock 25 reaction cards |
| Perfect Boss | 100% score on any boss level |
| Reaction Ninja | Collect all reaction cards |
| Organic Grandmaster | Reach Level 7 |

---

### 9. Reaction Cards

Every reaction mastered (3 correct answers) unlocks its collectible card. Card shows:
- Reaction name
- Difficulty (⭐ to ⭐⭐⭐)
- Reactants, Reagent, Product
- Reaction type color border
- Date unlocked

Cards visible on profile. Progress shown as: "42 / 120 cards collected."

---

### 10. Leaderboard

- Tabs: Daily / Weekly / Monthly / All-Time
- Filter: Class 11 / Class 12 / All
- Columns: Rank, Username, Level, XP, Streak
- Student's own row always pinned at the bottom even if outside top 10
- Guest-visible (read-only)

---

### 11. Hint / Story System (Static AI Tutor Replacement)

Each reaction in the DB stores authored text fields:

| Field | Shown When |
|---|---|
| `hint_wrong_reagent` | Student picks wrong reagent |
| `hint_wrong_product` | Student picks wrong product |
| `hint_wrong_reactant` | Student picks wrong reactant |
| `story_text` | Narrative explanation (always shown after answer) |
| `why_text` | Mechanistic reason (shown after wrong answer) |

Example for Ethanol → Ethanoic Acid:
- `hint_wrong_reagent` (if student picks H₂/Ni): "H₂/Ni is a reducing agent — it adds hydrogen. This reaction needs oxidation, which removes hydrogen. Try an oxidizing agent."
- `story_text`: "Ethanol meets KMnO₄, a powerful oxidizing agent. It strips two hydrogen atoms away, first forming an aldehyde, then pushing further to form Ethanoic Acid."
- `why_text`: "KMnO₄ contains Mn in +7 oxidation state. It accepts electrons from the carbon chain, oxidizing the -OH group all the way to -COOH."

This is more consistent and targeted than a generic AI response.

---

### 12. Reagent Classification Reference

Accessible from any question as a "cheat sheet" toggle (does not count as hint usage):

**Oxidizing Agents**: KMnO₄, K₂Cr₂O₇, O₃, CrO₃, PCC (mild)  
**Reducing Agents**: LiAlH₄, NaBH₄, H₂/Ni, H₂/Pd  
**Halogenating Agents**: Cl₂, Br₂, SOCl₂, PCl₅, PBr₃  
**Bases**: KOH (aq) = nucleophilic sub, KOH (alc) = elimination  
**Nucleophiles**: OH⁻, CN⁻, NH₃, RO⁻  
**Electrophiles**: H⁺, Br⁺, NO₂⁺, SO₃  

---

## Content Coverage

### Named Reactions (tagged in DB)
Wurtz, Friedel-Crafts Alkylation, Friedel-Crafts Acylation, Cannizzaro, Aldol Condensation, Tollens Test, Fehling Test, Sandmeyer, Balz-Schiemann, Reimer-Tiemann, Kolbe, Hell-Volhard-Zelinsky, Clemmensen Reduction, Wolff-Kishner Reduction, Hoffmann Bromamide, Rosenmund Reduction, Stephen Reaction, Etard Reaction

### Reaction Types Covered
- Nucleophilic Substitution (SN1, SN2)
- Electrophilic Substitution (Benzene ring reactions)
- Nucleophilic Addition (Aldehydes, Ketones)
- Electrophilic Addition (Alkenes, Alkynes)
- Elimination (E1, E2)
- Oxidation (mild: PCC, strong: KMnO₄)
- Reduction (LiAlH₄, NaBH₄, H₂/Ni)
- Rearrangements (Hofmann, Beckmann)

---

## Pages & Routes

```
/                        Dashboard (works for guests and logged-in users — same page)
/login                   Login
/signup                  Sign up (with guest XP transfer on completion)
/learn                   Chapter map (class 11 / 12 toggle)
/learn/[chapter]         Chapter overview + reaction tree
/practice/[chapter]      Practice module selection
/practice/[chapter]/[module]  Active question session
/boss/[chapter]          Boss level
/escape-room             Escape room mode
/timed                   60-second timed challenge
/leaderboard             Leaderboard — visible to all, rankings only for logged-in users
/cards                   Reaction card collection (guest: shows session cards, not persisted)
/badges                  All badges (guest: all shown as locked with "sign up to earn")
/u/[username]            Public profile (logged-in users only)
/settings                Account settings, privacy toggle (logged-in users only)
/reference               Reagent classification + conversion charts (open to all)
```

There is no separate landing/marketing page. The root `/` renders the full dashboard. Guests see the same UI as logged-in users except: streaks are hidden, leaderboard rank is hidden, and the persistent sign-up banner is shown at the top.

---

## Build Order (Suggested 8-Week Sprints)

| Week | Focus |
|---|---|
| 1 | Project scaffold, Neon DB setup, Drizzle schema, NextAuth, sign up / login |
| 2 | Dashboard, XP system, streak logic, Reaction of the Day |
| 3 | Module 1 (MCQ Build the Reaction), hint system, confetti on correct |
| 4 | Module 2 (Name the Reaction), leaderboard, badges |
| 5 | Boss Levels, chapter gating, Escape Room framing |
| 6 | Module 4 (Pathway Challenge), Visual Reaction Trees |
| 7 | Module 3 (Drag & Drop), Module 5 (Timed Challenge), Reaction Cards |
| 8 | Public profiles, privacy toggle, reference charts, content entry (all NCERT reactions + hints) |

---

## Guest vs Logged-In Feature Comparison

| Feature | Guest | Logged-In |
|---|---|---|
| Practice all reactions | ✅ | ✅ |
| All 5 modules | ✅ | ✅ |
| Hints and explanations | ✅ | ✅ |
| Visual Reaction Trees | ✅ | ✅ |
| Conversion Charts + Reference | ✅ | ✅ |
| Reaction of the Day | ✅ (no bonus XP saved) | ✅ |
| Boss Levels | ✅ (result not saved) | ✅ |
| Timed Challenge | ✅ (not on leaderboard) | ✅ |
| Session XP (local) | ✅ localStorage | ✅ DB |
| Streak | ❌ | ✅ |
| Leaderboard rank | ❌ | ✅ |
| Badges | ❌ (visible but locked) | ✅ |
| Reaction Cards | ❌ (not persisted) | ✅ |
| Public profile | ❌ | ✅ |
| XP transferred on sign-up | ✅ from localStorage | — |

---

## What Is Deliberately Excluded from V1

| Feature | Reason | V2 Path |
|---|---|---|
| Live Reaction Battles | Needs WebSockets (Pusher/Ably) | Add in V2 with teacher role |
| Real AI explanations | Needs LLM API + cost | Authored hints cover this well |
| Teacher Dashboard | Scope for V1 | Teacher role in same DB + analytics page |
| Email OTP verification | Needs email service | Add Resend (free tier) in V2 |
| Mobile app | Separate project | PWA wrapper first, then React Native |
