# Sprint 3 — Module 1 (MCQ Build the Reaction) · Hint System · Guest Access

**Duration**: Week 3  
**Goal**: Students can practice reactions end-to-end through Module 1 MCQ. Hints show on wrong answers. Confetti fires on correct answers. Guests can practice freely with no sign-up prompts.

---

## Tasks

### 3.1 Module 1 — Build the Reaction (MCQ)

**Route**: `/practice/[chapter]/module-1`

- [ ] Load reactions for the chapter from DB (`GET /api/reactions?chapter=[id]&module=1`)
- [ ] Question card component:
  - Shows conversion goal: "Convert Ethene → Bromoethane"
  - Equation display area (text-based, using Unicode for subscripts/superscripts)
  - 4-option MCQ for reagent (primary question type for Module 1)
  - Optional: 4-option MCQ for reactant and product (when `question_type` includes them)
- [ ] Answer selection:
  - Tap to select → option highlights
  - Submit button (or auto-submit on select — pick one; keep consistent)
  - No answer change after submit
- [ ] Correct answer flow:
  - Green border on correct option
  - Confetti burst (canvas-confetti or custom CSS)
  - "+20 XP" floating animation
  - `story_text` slides in below the card
  - "Next →" button appears
- [ ] Wrong answer flow:
  - Red border on selected option, green border on correct option revealed
  - `hint_wrong_reagent` / `hint_wrong_product` / `hint_wrong_reactant` text shown based on which type was wrong
  - `why_text` shown below hint
  - "Try Next →" button appears (student does not re-answer; they see the correct answer and move on)
- [ ] Session: 5 questions per session drawn randomly from the chapter, weighted toward reactions the user has answered fewer times

### 3.2 Session Summary Screen
- [ ] After 5 questions:
  - Score: N/5 (N%)
  - XP earned this session
  - List of reactions with ✓ or ✗
  - "You struggled with [reaction] — practice it again tomorrow" (for any reaction with 0 correct this session)
  - "Reaction card unlocked" if any reaction reached 3 correct total
  - "Try Again" and "Back to Chapter" buttons

### 3.3 XP Award Integration
- [ ] Call `POST /api/xp/award` after each correct answer (logged-in users)
- [ ] For guests: update `localStorage` `guest_xp` and `guest_xp_log`
- [ ] Nav XP counter updates live (both guest and logged-in)
- [ ] `user_progress` updated: `attempts++`, `correct_count++` (if correct), `last_attempted = now`
- [ ] Check mastery: if `correct_count >= 3` → `mastered = true` → unlock reaction card

### 3.4 Hint System
- [ ] `hint_wrong_reagent`, `hint_wrong_product`, `hint_wrong_reactant` stored per reaction in DB
- [ ] Hint component: slides in with animation, styled as a "chemistry teacher's note" card
- [ ] `story_text` always shown after answer (correct or wrong)
- [ ] `why_text` shown only after wrong answer
- [ ] Hint display does not deduct XP (they appear automatically; no cost)

### 3.5 Guest Access Polish
- [ ] Confirm all practice routes work with no session (no auth redirect)
- [ ] Guest XP updates in `localStorage` after every correct answer
- [ ] Session XP shown in nav (reads from localStorage reactively)
- [ ] Guest accuracy tracked locally: `guest_correct / guest_attempts` in localStorage
- [ ] At end of session, guest sees session summary (no "save" option but XP shown)
- [ ] "Sign up to save your progress" shown subtly in session summary (not a modal)

### 3.6 Reaction Data Entry (Module 1 content)
- [ ] Enter minimum 5 reactions per chapter for Hydrocarbons and Haloalkanes to enable testing
- [ ] Each reaction needs: `question_text`, `equation_text`, 4 `reaction_options` (one correct), `hint_wrong_reagent`, `story_text`, `why_text`
- [ ] Use seed script or admin data entry (no admin UI yet — use direct DB insert or script)

---

## Acceptance Criteria

- Guest can open a chapter, start Module 1, answer 5 questions, see session summary — no login required
- Correct answer: confetti, "+XP" animation, story text shown, nav XP counter updates
- Wrong answer: correct answer revealed, specific hint shown, why text shown
- Session summary shows score, XP earned, any unlocked cards noted
- Logged-in user's `user_progress` updated in DB after each answer
- 3 correct answers on same reaction → reaction card unlocked

---

## Key Files Created / Modified
```
src/app/practice/[chapter]/module-1/page.tsx
src/components/QuestionCard.tsx
src/components/AnswerOption.tsx
src/components/HintPanel.tsx
src/components/Confetti.tsx
src/components/XPAnimation.tsx
src/components/SessionSummary.tsx
src/app/api/reactions/route.ts
src/app/api/progress/route.ts
src/lib/guest.ts                        localStorage read/write helpers
scripts/seed-reactions.ts
```

---

## User Journey Coverage
- **Journey 1 (Guest)**: Steps 2 & 3 — clicking a chapter, seeing a question immediately, "+20 XP" on correct answer, XP counter updating, no sign-up modal.
- **Journey 3 (Returning Student — Free Practice)**: Module 1 session, wrong answer hint for Finkelstein, session summary with "struggled with" card.
- **Journey 10 (Reference Charts)**: Reference icon in question card (drawer built here, content in Sprint 8).
- **Edge case**: No reactions left in a chapter → "You've practiced all reactions! Try the boss level."
