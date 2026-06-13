# Level Up Chemistry — User Journeys

All journeys assume the app is live at `levelupchemistry.in` (or Vercel URL).

---

## Journey 1: First-Time Guest Visitor

**Persona**: Aryan, Class 12 student, found the link from a friend's WhatsApp.

---

**Step 1 — Landing Directly on the Dashboard**

Aryan opens the link. There is no marketing page — he lands straight on the dashboard, fully functional, with no login required.

He sees:
- A slim banner at the very top of the page:
  > "You're practicing as a guest — your progress won't be saved. [Sign up free] to keep your XP, earn badges, and join the leaderboard."
- Below the banner: the full dashboard — Reaction of the Day card, chapter map, session XP counter (starts at 0), leaderboard (read-only)
- Class 11 / Class 12 tabs on the chapter map

Everything is clickable. Nothing is locked.

**Step 2 — Jumping Straight Into Practice**

Aryan clicks "Hydrocarbons" on the chapter map. He sees the chapter overview with a reaction tree preview and three module options. He clicks "Build the Reaction (Module 1)."

A question appears immediately:

> "Convert Ethene to Bromoethane. Choose the correct reagent."
> ○ KMnO₄  ○ H₂/Ni  ● HBr  ○ NaOH

He picks HBr. Confetti bursts. "+20 XP" appears on screen. The XP counter in the nav updates to "20 XP (session)." There is no prompt to sign up — he just keeps going.

**Step 3 — Practicing Freely**

Aryan does 15 reactions across two chapters. His session XP climbs to 280. He reads hint explanations when he gets something wrong. He checks the leaderboard — he can see other students' ranks but his own row shows: "Sign up to appear on the leaderboard."

The sign-up banner remains at the top throughout, non-intrusive. At no point is he stopped or shown a modal.

**Step 4 — Deciding to Sign Up**

After 20 minutes of practice, Aryan notices his session XP is 320 and clicks the "Sign up free" link in the top banner. He is taken to the sign-up page. His 320 XP is shown:
> "You've earned 320 XP this session — it'll be saved to your account when you sign up."

---

## Journey 2: New Student Sign-Up

**Persona**: Aryan (continuing from Journey 1, with 320 guest XP in localStorage).

---

**Step 1 — Sign-Up Form**

Form fields:
1. Full Name
2. Username (checked for availability in real time — green tick when available)
3. Email address
4. Phone number
5. Password (min 8 chars)
6. Class: Class 11 / Class 12 / Both

He fills in the form. Username "aryan_chem" shows a green tick. He submits.

**Step 2 — Guest XP Transfer**

On account creation, the app reads `localStorage`, finds 320 XP and the list of reactions he attempted in the session, and writes them to the database as his starting progress. `localStorage` is then cleared.

He is logged in immediately and redirected to the dashboard. A welcome banner replaces the sign-up reminder:
> "Welcome to Level Up Chemistry, Aryan! Your 320 guest XP has been saved to your account."

**Step 3 — Dashboard as a Logged-In User**

The top banner is gone. The dashboard now shows:
- Streak: 🔥 1 day (today)
- XP: 320 / 500 to next level (Reaction Rookie)
- Current level: Organic Beginner
- Reaction of the Day card (with a 23-hour countdown timer)
- Leaderboard rank: #31 (all-time) — now visible
- "Continue where you left off" → Haloalkanes (next chapter)

---

## Journey 3: Returning Student — Daily Practice Session

**Persona**: Priya, Class 11, has been using the app for 12 days. Current streak: 12 days. Level: Hydrocarbon Hero.

---

**Step 1 — Login**

Priya opens the app and logs in with her username and password.

**Step 2 — Dashboard Check**

Dashboard shows:
- 🔥 12-day streak — "Complete today's reaction to keep it alive!"
- Reaction of the Day: highlighted card with a pulsing border
- XP: 1,340 / 2,000 to next level
- Weekly leaderboard rank: #5

**Step 3 — Reaction of the Day**

Priya taps the Reaction of the Day card. A Module 2 (Name the Reaction) question appears:

> CH₃COOH + C₂H₅OH → CH₃COOC₂H₅
> What is this reaction called?
> ○ Cannizzaro  ○ Wurtz  ● Esterification  ○ Aldol

She selects Esterification. Confetti. "+50 XP (Daily Bonus)." Her streak updates to 13 days.

**Step 4 — Free Practice**

Priya navigates to Haloalkanes chapter. She selects Module 1. Five questions appear in a session. After each correct answer, a small animation plays. After each wrong answer, the hint text slides in explaining the mistake. She finishes 4/5 correct.

Session summary screen:
- Score: 4/5 (80%)
- XP earned: +80
- Reactions practiced: SN1 (✓), SN2 (✓), E2 (✓), Wurtz (✓), Finkelstein (✗)
- "You struggled with Finkelstein Reaction — practice it again tomorrow"
- Cards unlocked: Wurtz Reaction card added to collection

**Step 5 — Checking Leaderboard**

Priya taps Leaderboard. She sees the weekly tab:
1. Rohan_Singh — 2,400 XP — 🔥 20 days
2. isha_chem — 1,980 XP — 🔥 15 days
3. priya_12b — 1,870 XP — 🔥 13 days ← her row highlighted

She is 110 XP behind second place. She decides to do a timed challenge.

**Step 6 — Timed Challenge**

She enters the 60-second mode. 9 reactions fly by. She gets 7 correct. Score saved. Leaderboard rank updates to #4.

---

## Journey 4: Boss Level Attempt

**Persona**: Karan, Class 12, completing the Aldehydes & Ketones chapter. He has practiced all reactions in the chapter.

---

**Step 1 — Boss Level Entry**

On the chapter map, the Aldehydes & Ketones card shows a progress bar at 100% and a "Boss Level Ready" badge pulsing. He taps it.

Entry screen:
> "Aldehydes & Ketones Boss Level"
> 20 questions · 10 minutes · Need 16/20 to clear
> Rewards: Aldehyde Ace Badge + 200 XP + Chapter Card

He taps "Start Boss Level."

**Step 2 — Boss Questions**

Mixed questions from all three modules — some MCQ, some name-the-reaction, some pathway. Questions pulled from across the chapter at random. No hints shown during a boss level (hints are disabled to maintain difficulty). Timer counts down from 10:00.

**Step 3 — Results**

Karan finishes with 17/20 in 8:32.

Results screen:
- ✅ Boss Cleared! 17/20
- +200 XP
- 🏅 "Aldehyde Ace" badge earned — animated badge reveal
- Aldehydes & Ketones reaction card added to collection
- "Carboxylic Acids chapter is now unlocked!"

He is redirected to the chapter map where the Carboxylic Acids door visually unlocks with an animation.

---

## Journey 5: Escape Room Mode

**Persona**: Sneha, Class 11, wants a challenge different from regular practice.

---

**Step 1 — Entering the Escape Room**

Sneha taps "Escape Room" from the home nav. Intro screen:
> "You are locked in the Organic Chemistry Lab. Solve reactions to unlock each door and escape."

She selects Class 11. Five doors are shown. Doors 2-5 are locked (padlock icons).

**Step 2 — Door 1: Hydrocarbons**

Door 1 opens. Inside, 5 reactions must be solved in sequence. Each correct answer "unlocks" a visual keyhole. One wrong answer means she tries that reaction again (no penalty, just try again). She clears all 5.

Door 2 slides open with a sound effect. She enters Haloalkanes.

**Step 3 — Progression**

She works through 3 doors. On Door 4, she gets stuck on an E2 elimination question. The door stays locked. She taps "Need a clue" — this costs 10 XP and shows the `why_text` hint. She uses it, gets the answer right, and moves forward.

**Step 4 — Escape!**

After clearing all 5 doors:
> "You escaped! Time: 18 minutes 42 seconds."
> +100 XP · "Escape Artist" badge earned

Her escape time is saved and shown on a separate Escape Room leaderboard.

---

## Journey 6: Reaction Pathway Challenge

**Persona**: Dev, Class 12, strong at individual reactions but weak at multi-step conversions.

---

**Step 1 — Selecting Pathway Mode**

Dev opens the Haloalkanes chapter and selects "Pathway Challenge." A goal appears:

> "Convert Methane → Methanol in as few steps as possible."

**Step 2 — Picking Steps**

Step 1 prompt: "What is Methane converted to first?"
Options: Methanol / Chloromethane / Ethane / Methanoic Acid

He picks Chloromethane (correct — via Cl₂/hv). +20 XP.

Step 2 prompt: "What does Chloromethane become next?"
Options: Methanol / Methanal / Ethanol / Chloroethane

He picks Methanol (correct — via KOH aq). +20 XP.

Pathway complete! Reaction map visualized:
```
Methane → (Cl₂, hv) → Chloromethane → (KOH aq) → Methanol
```

+80 XP bonus for pathway completion. Pathway card saved.

**Step 3 — Reviewing the Path**

The completed pathway is saved in his "Pathway Cards" section. He can revisit it as a visual reference anytime.

---

## Journey 7: Viewing and Sharing a Public Profile

**Persona**: Riya wants to share her chemistry progress with her friend.

---

**Step 1 — Profile Page**

Riya visits her own profile at `/u/riya_organic`. She sees:
- Avatar (initials-based, color from her username hash)
- Level: Conversion King (Level 5)
- XP: 2,340
- Streak: 🔥 45 days
- Accuracy: 78%
- Class: Class 12
- Badges: 8 earned, shown as a grid (locked badges shown grayed out)
- Reaction Cards: 34/120 collected
- Member since: March 2025

**Step 2 — Privacy Setting**

Riya goes to Settings → Privacy. Toggle: "Public Profile: ON." She can see a preview of what her profile looks like to others.

**Step 3 — Sharing**

She taps "Copy Profile Link." The link `levelupchemistry.in/u/riya_organic` is copied. She pastes it in a WhatsApp message to her friend.

Her friend, who has no account, opens the link and sees Riya's public profile. A banner at the top: "Create your own profile free at Level Up Chemistry."

---

## Journey 8: Drag and Drop Mechanism (Module 3)

**Persona**: Amit, struggling to understand SN2 mechanism, not just the equation.

---

**Step 1 — Entering Module 3**

Amit opens Haloalkanes → Practice → Mechanism (Drag & Drop). An SN2 question loads.

A reaction diagram is shown with 4 blank label slots:
- Near the carbon bearing Br: [___]
- Near the attacking OH⁻: [___]
- Near the Br leaving: [___]
- Near the bond forming: [___]

Available labels to drag: "Electrophilic Carbon", "Nucleophile", "Leaving Group", "New Bond"

**Step 2 — Dragging Labels**

Amit drags:
- "Nucleophile" onto OH⁻ ✓
- "Leaving Group" onto Br ✓
- "Electrophilic Carbon" onto the carbon ✓
- "New Bond" onto the forming C-O bond ✓

All correct. Confetti. +30 XP.

The `story_text` appears:
> "OH⁻ is electron-rich and attacks the electrophilic carbon from the back (anti to Br). As OH bonds to carbon, Br detaches with its electrons. This single-step backside attack is the SN2 mechanism."

**Step 3 — Wrong Drag**

On the next question (SN1), Amit drags "Nucleophile" in the wrong position. The label snaps back to the tray. A gentle red border flashes on that slot. He can try again without penalty until correct.

---

## Journey 9: Leaderboard Competition

**Persona**: Three friends — Arjun, Meenal, and Kabir — in the same school using the app during exam season.

---

**Weekly Competition**

Monday morning: All three start the week at similar XP.

- Arjun does 20 reactions/day, maintains a 30-day streak, completes two boss levels. By Friday: +1,200 XP.
- Meenal focuses on timed challenges. 10 sessions of 7+ correct. By Friday: +900 XP.
- Kabir is inconsistent — practices Tuesday, Thursday, Saturday. By Friday: +600 XP.

Friday leaderboard (weekly, Class 12):
1. Arjun_A — 1,200 XP 🥇
2. meenal_k — 900 XP 🥈
3. kabir_12 — 600 XP 🥉

All three can see each other's positions. Kabir texts Meenal: "I'm catching up next week." Friendly competition drives more practice.

---

## Journey 10: Using the Reference Charts

**Persona**: Nisha, stuck on which oxidizing agent to use, mid-question.

---

**Step 1 — During a Practice Session**

Nisha is in Module 1. The question asks for the reagent to convert a primary alcohol to a carboxylic acid. She is unsure whether to use PCC or KMnO₄.

She taps the "Reference" icon (book icon in the corner of the question card).

**Step 2 — Reference Drawer**

A side drawer slides in (does not close the question). It shows the Oxidizing Agents section:
- KMnO₄ — strong oxidizer, converts primary alcohol → carboxylic acid
- PCC — mild oxidizer, converts primary alcohol → aldehyde (stops here)
- K₂Cr₂O₇ — strong oxidizer, similar to KMnO₄

**Step 3 — Back to Question**

Nisha closes the drawer. She now picks KMnO₄ confidently. Correct answer. The question is answered with reference used, which is noted in her progress (reference usage does not deduct XP but is tracked for her own awareness).

---

## Journey 11: Student Who Fails a Boss Level

**Persona**: Rohan, Class 11, attempts the Hydrocarbons boss level for the first time.

---

**Attempt 1**

Rohan scores 11/20 (55%). Below the 80% threshold. Results screen:

> "Not quite! You need 16/20 to unlock the next chapter."
> Score: 11/20
> Weakest areas: Ozonolysis (0/3) · Markovnikov's Rule (1/3)
> "Practice these reactions before your next attempt."

He is shown two quick-practice cards for Ozonolysis and Markovnikov's Rule. He practices them (Module 1, 5 questions each).

**Attempt 2**

Next day, Rohan tries again. He scores 17/20. Boss cleared. The weak-area practice paid off.

---

## Edge Cases & Error States

| Situation | What the App Does |
|---|---|
| Student misses a day (streak breaks) | Dashboard shows "Streak lost 😔" with option to use a Streak Freeze if available |
| Guest tries to view leaderboard rank | Their row shows "Sign up to appear on the leaderboard" — no modal, no block |
| Guest closes the tab (localStorage lost) | XP is lost — this is communicated clearly in the banner. No recovery. |
| Guest signs up from a different device | localStorage is device-local; XP from that session cannot be transferred. Sign-up page shows 0 XP to transfer, which is correct. |
| Student attempts boss 3 times in one day | "Daily attempt limit reached. Come back tomorrow." |
| Two students try same username | Real-time availability check on signup; red message shown inline |
| Student makes profile private | `/u/[username]` shows: "This profile is private." |
| No reactions left in a chapter | "You've practiced all reactions in this chapter! Try the boss level." |
| Guest visits `/settings` or `/u/[username]` | Redirected to `/login` with message: "Sign in to access your profile." |
| Guest earns a badge condition (locally) | Badge shown as "earned in session" but grayed with "Sign up to keep this badge" |

---

## Notification Triggers (Future / Email)

When email service is added (Resend, free tier):

| Trigger | Message |
|---|---|
| Streak at risk (7pm, no activity) | "Your 🔥 15-day streak ends in 5 hours. Practice one reaction!" |
| New chapter unlocked | "Carboxylic Acids chapter is now unlocked!" |
| Overtaken on leaderboard | "Meenal just passed you on the weekly leaderboard!" |
| Badge earned | "You earned the Aldehyde Ace badge!" |
