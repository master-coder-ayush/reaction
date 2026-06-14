# Level Up Chemistry — Design System

A clean, modern, **light-only**, student-friendly system with a balanced multi-color palette.
Source of truth for colors/utilities is [`app/globals.css`](app/globals.css). Icons:
[`lucide-react`](https://lucide.dev). This doc is the styling **contract** — follow it so every
redesigned component stays consistent.

> Hard rule for all redesign work: **UI only.** Change classNames / JSX structure / icons / colors
> only. Never change component props, exported types, state, hooks, event handlers, data fetching,
> API routes, DB, or auth. If a component exports a `type`, keep it byte-for-byte.

## Palette

Each accent exists as Tailwind utilities `bg-*`, `text-*`, `border-*`, plus a soft tint `*-soft`
for surfaces/chips, and a CSS `--*-border` var for the chunky button edge.

| Role        | Token       | Tailwind        | Soft surface        | Use for                                  |
|-------------|-------------|-----------------|---------------------|------------------------------------------|
| Green       | `primary`   | `bg-primary`    | `bg-primary-soft`   | primary CTAs, success, XP, mastery       |
| Blue        | `secondary` | `bg-secondary`  | `bg-secondary-soft` | learn, info, links, secondary CTAs       |
| Purple      | `accent`    | `bg-accent`     | `bg-accent-soft`    | badges, achievements, premium/flair      |
| Teal        | `info`      | `bg-info`       | `bg-info-soft`      | reference, calm info, streak-freeze      |
| Orange      | `warn`      | `bg-warn`       | `bg-warn-soft`      | timed/energy, streaks, highlights        |
| Pink        | `pink`      | `bg-pink`       | `bg-pink-soft`      | cards, fun highlights, leaderboard flair |
| Amber/Gold  | `warning`   | `bg-warning`    | `bg-warning-soft`   | warnings, daily challenge, rank #1       |
| Red         | `destructive` | `bg-destructive` | `bg-destructive-soft` | errors, wrong answers, danger         |

Neutrals: `bg-background` (white), `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`,
`border-border`. Focus ring: `ring-ring` (indigo).

**Consistency rule:** pick one accent per feature and use it everywhere for that feature (icon chip,
badge, progress, button). Suggested page→accent mapping used by the sidebar:

- Dashboard → primary (green) · Learn → secondary (blue) · Timed → warn (orange)
- Escape Room → accent (purple) · Cards → pink · Reference → info (teal)
- Leaderboard → warning (amber) · Badges → accent (purple) · Settings → muted/slate

**Reaction-type colors are content semantics — do not repurpose:** `text-addition` (blue),
`text-substitution` (purple), `text-elimination` (orange), `text-oxidation` (red),
`text-reduction` (green), `text-nucleophilic` (teal), `text-electrophilic` (yellow). Many components
already receive a `color` value from the DB — keep using it.

## Utilities (defined in globals.css)

- Elevation: `shadow-soft`, `shadow-soft-lg` (prefer over heavy borders on hero surfaces).
- `card-soft` — white card, 1px border, soft shadow, `rounded-2xl`-ish radius.
- `icon-chip` — 2.5rem rounded tile; combine with `bg-<accent>-soft text-<accent>` and a lucide icon.
- Gradients: `gradient-brand`, `gradient-blue`, `gradient-purple`, `gradient-warm`, `gradient-teal`,
  `gradient-sunrise` (use on banners/hero headers; put white text on them).
- `bg-app` — subtle tinted page wash (used by the shell content area).
- `text-gradient` — gradient headline text.
- `fade-rise` — gentle entrance animation for dashboard cards (respects reduced-motion).

## Components / primitives

Use the shared primitives instead of re-rolling markup:

- `Button` (`components/ui/button.tsx`): variants `primary | secondary | destructive | outline |
  ghost | accent | info | warn`; optional `size="sm|md|lg"`. Chunky press preserved.
- `Card` (`components/ui/card.tsx`): default soft card; optional `accent="blue|purple|green|orange|
  pink|teal"` (adds a colored top accent + tint) and `hover` (lift on hover).
- `Input` (`components/ui/input.tsx`): rounded, indigo focus ring.
- `Badge` (`components/ui/badge.tsx`): colored pill — `tone="green|blue|purple|teal|orange|pink|
  amber|red|slate"`, optional `soft`.
- `StatCard` (`components/ui/stat-card.tsx`): icon chip + value + label, colored.
- `SectionHeader` (`components/ui/section-header.tsx`): icon + title + optional action.

## Shape / spacing / motion

- Radius: cards/inputs `rounded-2xl` (16px) or `rounded-xl`; pills `rounded-full`. Use the radius
  scale (`--radius*`); avoid sharp corners.
- Spacing rhythm: page gutters `px-4`, section gaps `gap-6` / `space-y-6`, card padding `p-5`/`p-6`.
- Shadows: soft only (`shadow-soft`), no harsh `shadow-xl`. Borders are subtle (`border-border`).
- Motion: subtle. Reuse `fade-rise`, `btn-chunky`, existing keyframes; `framer-motion` is available.
  Always keep transitions short (hover lift ~1px). Reduced-motion is already handled globally.

## Typography

Nunito (rounded, friendly) for UI; JetBrains Mono for equations/code. Headings
`font-extrabold tracking-tight`; body `text-sm`/`text-base`; muted captions `text-muted-foreground`.

## Layout / shell

The app uses a left **Sidebar** (`components/Sidebar.tsx`) inside `components/AppShell.tsx` as the
primary nav (collapsible, mobile drawer, active state). Pages render their own `<main>` inside the
shell. A **Guest Mode** badge appears in the shell for guests; login/signup stays optional and never
blocks access. Don't add per-page top navbars — the shell handles chrome.
