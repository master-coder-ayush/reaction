# Sprint 1 — Scaffold · Database · Authentication

**Duration**: Week 1  
**Goal**: A working Next.js app with DB connected and full auth flow (sign up, login, session).

---

## Tasks

### 1.1 Project Setup
- [x] `npx create-next-app@latest` with TypeScript, Tailwind, App Router
- [x] Install dependencies: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `next-auth@beta`, `shadcn/ui` init, `framer-motion`, `dnd-kit`
- [x] Set up `.env.local`: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [x] Configure Tailwind + shadcn/ui base theme (color tokens from PLAN.md reaction type colors)
- [x] Set up absolute imports (`@/`)

### 1.2 Neon DB + Drizzle Schema
- [ ] Create Neon project, copy connection string
- [x] Write Drizzle schema file (`src/db/schema.ts`) with all tables:
  - `users`, `user_stats`, `categories`, `reaction_types`, `reactions`, `reaction_options`
  - `reaction_pathways`, `pathway_steps`, `user_progress`
  - `badges`, `user_badges`, `reaction_cards`, `daily_challenges`, `leaderboard_snapshots`
- [x] `drizzle.config.ts` pointing at Neon
- [ ] Run `drizzle-kit generate` + `drizzle-kit migrate`
- [ ] Verify all tables created in Neon console

### 1.3 NextAuth v5 Setup
- [x] `auth.ts` with Credentials provider (email-or-username + password)
- [x] `src/app/api/auth/[...nextauth]/route.ts`
- [x] Session strategy: JWT, include `userId` and `username` in token
- [x] Proxy (`proxy.ts`) protecting `/settings` and `/u/[username]` (own edit) — guests may visit public profiles

### 1.4 Sign-Up Page (`/signup`)
- [x] Form fields: Full Name, Username, Email, Phone, Password, Class (11 / 12 / Both)
- [x] Real-time username availability check (debounced API call → `GET /api/check-username?u=`)
- [x] Password: min 8 chars, show/hide toggle
- [x] On submit: hash password (bcrypt), insert `users` row, insert `user_stats` row (xp=0, streak=0)
- [x] After DB insert: read `localStorage` for guest XP + attempted reactions, write to `user_stats` and `user_progress`, clear `localStorage`
- [x] Auto-login after sign-up, redirect to `/` with welcome banner state
- [x] Guest XP shown on sign-up page: "You've earned 320 XP this session — it'll be saved to your account."

### 1.5 Login Page (`/login`)
- [x] Email or username + password form
- [x] NextAuth `signIn("credentials", ...)` 
- [x] Redirect to `/` on success
- [x] Inline error on bad credentials (no toast — just below the field)

### 1.6 Seed Data
- [x] Seed script: insert reaction types (Addition/blue, Substitution/purple, Elimination/orange, Oxidation/red, Reduction/green, Nucleophilic/teal, Electrophilic/yellow)
- [x] Seed 5 categories (Hydrocarbons, Haloalkanes, Alcohols, Aldehydes & Ketones, Carboxylic Acids) with `order_index`
- [x] Seed 12 badge definitions from PLAN.md

---

## Acceptance Criteria

- `npm run dev` starts without errors
- All DB tables exist in Neon
- Can sign up with a new username + email
- Duplicate username shows real-time error; duplicate email shows error on submit
- Can log in with email or username
- Session persists across page refresh
- `/settings` redirects to `/login` when not logged in
- Guest XP (manually set in localStorage) transfers on sign-up

---

## Key Files Created
```
src/db/schema.ts
src/db/index.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/api/check-username/route.ts
src/app/api/signup/route.ts
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
auth.ts
middleware.ts
drizzle.config.ts
scripts/seed.ts
```

---

## User Journey Coverage
- **Journey 2 (New Student Sign-Up)**: Full sign-up form with real-time username check, guest XP transfer, immediate redirect to dashboard with welcome banner.
- **Journey 7 (Public Profile)**: Auth foundation; profile route protection.
- **Edge case**: Two students trying same username — handled in real-time by `/api/check-username`.
- **Edge case**: Guest visits `/settings` — redirected to `/login`.

---

## Implementation Progress

> Live log of what's been built. Updated as Sprint 1 proceeds.

### ✅ Done

**1.1 Project Setup**
- Next.js app scaffolded via `create-next-app@latest`: TypeScript, Tailwind v4, App Router, no `src/` dir, `@/*` import alias.
- Dependencies: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `next-auth@beta` (5.0.0-beta.31), `bcryptjs`, `zod` (transitive, used directly), `framer-motion`, `@dnd-kit/*`, `tsx` (for running scripts).
- `.env.example` template added (`DATABASE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET`, `NEXTAUTH_URL`). `.gitignore` un-ignores `.env.example`.
- Reaction-type color tokens added to `app/globals.css` via Tailwind v4 `@theme` (addition/blue, substitution/purple, elimination/orange, oxidation/red, reduction/green, nucleophilic/teal, electrophilic/yellow) plus surface/brand tokens. **shadcn/ui CLI was skipped** (blocked + heavy for this surface); minimal hand-rolled primitives in `components/ui/` (`button`, `input`) + `lib/utils.ts` `cn()` instead.
- Absolute imports (`@/*`) confirmed working.

**1.2 Neon DB + Drizzle Schema**
- `db/schema.ts` — all 14 tables (users, user_stats, categories, reaction_types, reactions, reaction_options, reaction_pathways, pathway_steps, user_progress, badges, user_badges, reaction_cards, daily_challenges, leaderboard_snapshots) with FKs, unique indexes (username, email, daily date, leaderboard period), and composite PKs.
- `db/index.ts` — Neon serverless `drizzle()` client.
- `drizzle.config.ts` — points at Neon; loads `.env.local` manually (no dotenv dep).
- `drizzle-kit generate` succeeded → `drizzle/0000_flippant_mantis.sql`. **`migrate` not yet run** — needs a real Neon `DATABASE_URL` in `.env.local`.

**1.3 NextAuth v5**
- `auth.ts` — Credentials provider (email-or-username + password, bcrypt compare), JWT session strategy, `userId`/`username` in token + session. JWT type augmented on `@auth/core/jwt` (the `next-auth/jwt` re-export breaks augmentation under `bundler` resolution).
- `app/api/auth/[...nextauth]/route.ts` — handlers export.
- `proxy.ts` (Next 16 renamed `middleware` → `proxy`) — protects `/settings`, redirects guests to `/login` with message + callbackUrl.

**1.4 Sign-Up** — `app/(auth)/signup/` page + client form: all fields, debounced real-time username check (`GET /api/check-username`), show/hide password, class selector, guest XP banner. `app/api/signup/route.ts` validates (zod), hashes (bcrypt), inserts user + user_stats (streak seeded at 1), transfers guest XP + filtered guest progress, then client clears localStorage and auto-logs-in → `/?welcome=1`.

**1.5 Login** — `app/(auth)/login/` page + client form: email-or-username, inline error below field, redirects to callbackUrl/`/`.

**1.6 Seed Data** — `scripts/seed.ts` (run via `npm run db:seed`): 7 reaction types, 5 categories, 12 badges. Idempotent (skips if reaction_types already populated).

**Verification**
- `tsc --noEmit` passes clean.
- `next build` succeeds — routes `/`, `/login`, `/signup`, 3 API routes, Proxy all compile.
- npm scripts added: `db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`.

### ⬜ Remaining (needs live Neon DB)
- Create Neon project, put real `DATABASE_URL` + generate `AUTH_SECRET` (`npx auth secret`) into `.env.local`.
- `npm run db:migrate` (or `db:push`), then `npm run db:seed`.
- Manual run-through of acceptance criteria against the live DB (signup, dup username/email, login, session persist, `/settings` redirect, guest XP transfer).
- Dashboard at `/` still the default scaffold page — built in Sprint 2 (welcome banner consumes `?welcome=1`).

### 📌 Notes / Decisions
- **No `src/` directory** — files live at repo root (`db/`, `lib/`, `components/`, `scripts/`, `auth.ts`, `proxy.ts`). Sprint doc's `src/...` paths map to root-level equivalents.
- **Next.js 16** (not 14 as PLAN.md says): `middleware` → `proxy.ts`; route `params`/`searchParams`/`cookies`/`headers` are async Promises. Proxy defaults to Node runtime (so it can import the DB-bound `auth`).
- **Zod 4**: `z.email()` (not `z.string().email()`).
- Node 20.20.1 / npm 10.8.2. `node`/`npm`/`npx` require an admin shell here; local `node_modules/.bin/*` binaries run fine.
- Tailwind v4 — color tokens in `globals.css` `@theme`, no JS config.
