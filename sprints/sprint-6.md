# Sprint 6 — Module 4 (Pathway Challenge) · Visual Reaction Trees

**Duration**: Week 6  
**Goal**: Students can follow multi-step reaction pathways and earn XP per step. Visual Reaction Trees are interactive and link back to practice.

---

## Tasks

### 6.1 Module 4 — Reaction Pathway Challenge

**Route**: `/practice/[chapter]/module-4`

- [ ] Chapter pathway list: show all pathways defined for this chapter
  - Each pathway card: "Convert [Start] → [End]", difficulty stars, estimated steps
- [ ] Pathway session (step-by-step):
  - Show current compound + conversion goal
  - "What is [Compound] converted to first?" → 4 options (intermediate compounds)
  - Correct step: "+20 XP" animation, arrow added to visual chain below
  - Wrong step: gentle shake on wrong option, student picks again (no penalty, re-attempt until correct)
  - After last step: completed pathway visualization displayed
    ```
    Methane → (Cl₂, hv) → Chloromethane → (KOH aq) → Methanol
    ```
  - +80 XP bonus for completing the full pathway
  - "Pathway Pioneer" badge on first pathway completed
  - Pathway card saved to user's collection (`reaction_cards` with a pathway type)
- [ ] Completed pathways accessible in a "Pathway Cards" section on the cards page (`/cards`)
- [ ] `POST /api/pathway/complete` — records completion, awards XP + bonus
- [ ] Pathway data: seed at least 2 pathways per chapter in `reaction_pathways` + `pathway_steps`

### 6.2 Pathway Pioneer Badge
- [ ] Wire `PATHWAY_FIRST` event → `badges.ts` → awarded on first pathway completion
- [ ] Badge shown in animated reveal on pathway completion screen

### 6.3 Visual Reaction Trees

**Route**: `/learn/[chapter]` (reaction tree section within chapter overview)

- [ ] Tree data structure: stored as nodes + edges in DB
  - Nodes: compound names (Alkane, Haloalkane, Alcohol, Aldehyde, etc.)
  - Edges: reagent label + reaction type (color)
- [ ] Render tree as a visual flowchart:
  - Use `react-flow` or a lightweight custom SVG/CSS tree
  - Each node: compound name chip, color border = reaction type color
  - Each edge: reagent label, arrowhead
  - Tree scrollable/zoomable on mobile (pinch zoom or horizontal scroll)
- [ ] Clickable nodes: clicking a node opens a mini-panel listing all reactions from that compound → "Practice this reaction" button links to Module 1 for that specific reaction
- [ ] Example tree for Hydrocarbons (from PLAN.md):
  ```
  Alkane
    └─(Halogenation/Cl₂,hv)→ Haloalkane
         └─(KOH aq)→ Alcohol
              ├─(PCC)→ Aldehyde
              │    └─(KMnO₄)→ Carboxylic Acid
              └─(H₂SO₄, heat)→ Alkene
  ```
- [ ] Color coding applied to edges (Reduction=green, Oxidation=red, Substitution=purple, etc.)
- [ ] Tree data seeded for Hydrocarbons and Haloalkanes chapters
- [ ] Available to guests (no auth required)

### 6.4 Chapter Overview Page Enrichment

**Route**: `/learn/[chapter]`

- [ ] Chapter overview now shows:
  - Chapter title + description
  - Reaction Tree (visual, interactive)
  - Module selection: Module 1, Module 2, Module 4 (pathway), Boss Level button (if eligible)
  - Progress: X/Y reactions mastered, % accuracy
  - "Boss Level Ready" badge pulsing if progress = 100%

---

## Acceptance Criteria

- Pathway Challenge plays step-by-step, each step awards 20 XP, completion awards 80 XP bonus
- Wrong step: re-attempt without penalty (no "strike" mechanic)
- Completed pathway visualized as a chain with reagents shown
- Pathway card saved to user collection; accessible on `/cards`
- Pathway Pioneer badge fires on first completion
- Reaction tree renders as interactive flowchart with color-coded edges
- Clicking a tree node shows practice links for that compound
- Tree available to guests

---

## Key Files Created / Modified
```
src/app/practice/[chapter]/module-4/page.tsx
src/components/PathwaySession.tsx
src/components/PathwayChain.tsx
src/components/ReactionTree.tsx
src/components/TreeNode.tsx
src/app/learn/[chapter]/page.tsx
src/app/api/pathway/complete/route.ts
src/app/api/tree/[chapter]/route.ts
scripts/seed-pathways.ts
scripts/seed-trees.ts
```

---

## User Journey Coverage
- **Journey 6 (Reaction Pathway Challenge)**: Dev, Methane → Methanol in 2 steps, "+20 XP" per step, "+80 XP" bonus, pathway chain visualization saved as card.
- **Journey 3 (Chapter Overview)**: Chapter page now shows the reaction tree before entering practice.
- **Edge case**: Guest can view reaction trees and do pathway challenges (XP goes to localStorage).
