import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  boolean,
  timestamp,
  date,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Users & stats
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    username: varchar("username", { length: 32 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    passwordHash: text("password_hash").notNull(),
    isPublic: boolean("is_public").notNull().default(true),
    // 11 / 12 / both
    classLevel: varchar("class_level", { length: 8 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_username_idx").on(t.username),
    uniqueIndex("users_email_idx").on(t.email),
  ]
);

export const userStats = pgTable("user_stats", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streakCurrent: integer("streak_current").notNull().default(0),
  streakLongest: integer("streak_longest").notNull().default(0),
  streakFreezeCount: integer("streak_freeze_count").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
  totalCorrect: integer("total_correct").notNull().default(0),
  totalAttempts: integer("total_attempts").notNull().default(0),
  // Best Escape Room time in seconds (Sprint 5 §5.4). Null until first escape.
  escapeBestSeconds: integer("escape_best_seconds"),
  // Best Timed Challenge score (correct answers in 60s — Sprint 7 §7.2). Used
  // for the Speed leaderboard and the Speed Demon badge. Null until first run.
  bestTimedScore: integer("best_timed_score"),
});

// ---------------------------------------------------------------------------
// Content: categories, reaction types, reactions, options
// ---------------------------------------------------------------------------

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // 11 / 12 / both
  classLevel: varchar("class_level", { length: 8 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const reactionTypes = pgTable("reaction_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // hex or token name; used for app-wide color coding
  color: varchar("color", { length: 32 }).notNull(),
  description: text("description"),
});

export const reactions = pgTable(
  "reactions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    reactionTypeId: integer("reaction_type_id")
      .notNull()
      .references(() => reactionTypes.id, { onDelete: "restrict" }),
    // NCERT / ICSE / Both
    board: varchar("board", { length: 16 }).notNull().default("Both"),
    classLevel: varchar("class_level", { length: 8 }).notNull(),
    difficulty: integer("difficulty").notNull().default(1), // 1-3
    questionText: text("question_text").notNull(),
    equationText: text("equation_text"),
    hintWrongReagent: text("hint_wrong_reagent"),
    hintWrongProduct: text("hint_wrong_product"),
    hintWrongReactant: text("hint_wrong_reactant"),
    storyText: text("story_text"),
    whyText: text("why_text"),
    realLifeUse: text("real_life_use"),
    isNameReaction: boolean("is_name_reaction").notNull().default(false),
    nameReactionLabel: text("name_reaction_label"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("reactions_category_idx").on(t.categoryId)]
);

export const reactionOptions = pgTable(
  "reaction_options",
  {
    id: serial("id").primaryKey(),
    reactionId: integer("reaction_id")
      .notNull()
      .references(() => reactions.id, { onDelete: "cascade" }),
    // reactant / reagent / product / name
    optionType: varchar("option_type", { length: 16 }).notNull(),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (t) => [index("reaction_options_reaction_idx").on(t.reactionId)]
);

// ---------------------------------------------------------------------------
// Pathways
// ---------------------------------------------------------------------------

export const reactionPathways = pgTable("reaction_pathways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  classLevel: varchar("class_level", { length: 8 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  description: text("description"),
});

export const pathwaySteps = pgTable(
  "pathway_steps",
  {
    id: serial("id").primaryKey(),
    pathwayId: integer("pathway_id")
      .notNull()
      .references(() => reactionPathways.id, { onDelete: "cascade" }),
    stepOrder: integer("step_order").notNull(),
    compoundName: text("compound_name").notNull(),
    reagentUsed: text("reagent_used"),
    reactionTypeId: integer("reaction_type_id").references(
      () => reactionTypes.id,
      { onDelete: "set null" }
    ),
  },
  (t) => [index("pathway_steps_pathway_idx").on(t.pathwayId)]
);

// ---------------------------------------------------------------------------
// Mechanisms — Module 3 Drag & Drop (Sprint 7 §7.1). Each mechanism is one
// reaction diagram (SN1/SN2/E2/Electrophilic Addition) with labelled slots the
// student fills by dragging label chips. Evaluation is client-side, so the
// correct answer (each slot's expected label) ships to the client; pass/fail is
// posted to /api/progress against the linked reaction. Seeded data only.
// ---------------------------------------------------------------------------

export const mechanisms = pgTable("mechanisms", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  // Optional link to a reaction so pass/fail records against user_progress.
  reactionId: integer("reaction_id").references(() => reactions.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  // SN1 / SN2 / E2 / Electrophilic Addition
  mechanismType: varchar("mechanism_type", { length: 32 }).notNull(),
  difficulty: integer("difficulty").notNull().default(2),
  // The reaction structure to render (simple expression, e.g. the substrate).
  diagramText: text("diagram_text").notNull(),
  storyText: text("story_text"),
});

// A drop target on the diagram. `correctLabel` is the label text that belongs
// here; `posX`/`posY` are 0-100 percentages for absolute placement on the SVG.
export const mechanismSlots = pgTable(
  "mechanism_slots",
  {
    id: serial("id").primaryKey(),
    mechanismId: integer("mechanism_id")
      .notNull()
      .references(() => mechanisms.id, { onDelete: "cascade" }),
    slotKey: varchar("slot_key", { length: 32 }).notNull(),
    correctLabel: text("correct_label").notNull(),
    posX: integer("pos_x").notNull().default(50),
    posY: integer("pos_y").notNull().default(50),
  },
  (t) => [index("mechanism_slots_mechanism_idx").on(t.mechanismId)]
);

// The tray chips for a mechanism. Includes every correct label plus optional
// distractors (correct labels are matched to slots by text on the client).
export const mechanismLabels = pgTable(
  "mechanism_labels",
  {
    id: serial("id").primaryKey(),
    mechanismId: integer("mechanism_id")
      .notNull()
      .references(() => mechanisms.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
  },
  (t) => [index("mechanism_labels_mechanism_idx").on(t.mechanismId)]
);

// Reaction trees (Sprint 6 §6.3). A tree is the set of nodes + edges for one
// chapter (category). Nodes are compounds; edges are reagent-labelled, coloured
// by reaction type. Rendered as a flowchart on /learn/[chapter] and seeded for
// Hydrocarbons + Haloalkanes. Public — guests read these freely.
export const treeNodes = pgTable(
  "tree_nodes",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    // Stable key within a chapter (e.g. "alkane") so edges can reference nodes
    // independently of serial ids across re-seeds.
    nodeKey: varchar("node_key", { length: 48 }).notNull(),
    compoundName: text("compound_name").notNull(),
    // Reaction-type color name (blue/purple/…); the node chip's border color.
    color: varchar("color", { length: 32 }),
    // Layout hints for the flowchart (column = depth, row = vertical slot).
    col: integer("col").notNull().default(0),
    row: integer("row").notNull().default(0),
  },
  (t) => [
    uniqueIndex("tree_nodes_category_key_idx").on(t.categoryId, t.nodeKey),
    index("tree_nodes_category_idx").on(t.categoryId),
  ]
);

export const treeEdges = pgTable(
  "tree_edges",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    fromKey: varchar("from_key", { length: 48 }).notNull(),
    toKey: varchar("to_key", { length: 48 }).notNull(),
    reagentLabel: text("reagent_label").notNull(),
    // Reaction-type color name for the edge (Reduction=green, etc.).
    color: varchar("color", { length: 32 }),
  },
  (t) => [index("tree_edges_category_idx").on(t.categoryId)]
);

// ---------------------------------------------------------------------------
// Progress, badges, cards
// ---------------------------------------------------------------------------

export const userProgress = pgTable(
  "user_progress",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reactionId: integer("reaction_id")
      .notNull()
      .references(() => reactions.id, { onDelete: "cascade" }),
    attempts: integer("attempts").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    lastAttempted: timestamp("last_attempted", { withTimezone: true }),
    mastered: boolean("mastered").notNull().default(false),
    // Set when this reaction was completed as the Reaction of the Day (2× XP).
    dailyBonus: boolean("daily_bonus").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.userId, t.reactionId] })]
);

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  // e.g. reactions_completed, streak_days, boss_cleared, level_reached, cards_collected, timed_score, correct_streak, pathway_completed
  requirementType: varchar("requirement_type", { length: 32 }).notNull(),
  requirementValue: integer("requirement_value").notNull().default(0),
  color: varchar("color", { length: 32 }),
});

export const userBadges = pgTable(
  "user_badges",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: integer("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] })]
);

export const reactionCards = pgTable(
  "reaction_cards",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reactionId: integer("reaction_id")
      .notNull()
      .references(() => reactions.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.reactionId] })]
);

// Pathway cards (Sprint 6 §6.1). The collectible earned for completing a
// pathway challenge. Mirrors `reaction_cards` but keyed by pathway — kept in its
// own table because reaction_cards' PK is (user, reaction). Shown in the
// "Pathway Cards" section on /cards.
export const pathwayCards = pgTable(
  "pathway_cards",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pathwayId: integer("pathway_id")
      .notNull()
      .references(() => reactionPathways.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.pathwayId] })]
);

// ---------------------------------------------------------------------------
// Boss levels & Escape Room (Sprint 5)
// ---------------------------------------------------------------------------

// One row per user per chapter per calendar day, tracking how many boss attempts
// were spent that day (capped at 3 — Sprint 5 §5.1). Checked on entry,
// incremented on submit.
export const bossAttempts = pgTable(
  "boss_attempts",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Chapter id (category order_index), matching the UI chapter map.
    chapter: integer("chapter").notNull(),
    attemptDate: date("attempt_date").notNull(),
    attempts: integer("attempts").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.chapter, t.attemptDate] }),
  ]
);

// One row per completed Escape Room run (Sprint 5 §5.4). The fastest per user is
// what the Escape Room leaderboard ranks; userStats.escapeBestSeconds caches it.
export const escapeRoomResults = pgTable(
  "escape_room_results",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // 11 / 12 — which class track was escaped.
    classLevel: varchar("class_level", { length: 8 }).notNull(),
    seconds: integer("seconds").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("escape_room_results_user_idx").on(t.userId)]
);

// ---------------------------------------------------------------------------
// Daily challenges & leaderboard
// ---------------------------------------------------------------------------

export const dailyChallenges = pgTable(
  "daily_challenges",
  {
    id: serial("id").primaryKey(),
    reactionId: integer("reaction_id")
      .notNull()
      .references(() => reactions.id, { onDelete: "cascade" }),
    challengeDate: date("challenge_date").notNull(),
  },
  (t) => [uniqueIndex("daily_challenges_date_idx").on(t.challengeDate)]
);

export const leaderboardSnapshots = pgTable(
  "leaderboard_snapshots",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    xp: integer("xp").notNull().default(0),
    // daily / weekly / monthly
    periodType: varchar("period_type", { length: 16 }).notNull(),
    // e.g. 2026-06-13 (daily), 2026-W24 (weekly), 2026-06 (monthly)
    periodKey: varchar("period_key", { length: 16 }).notNull(),
    rank: integer("rank"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("leaderboard_user_period_idx").on(
      t.userId,
      t.periodType,
      t.periodKey
    ),
    index("leaderboard_period_idx").on(t.periodType, t.periodKey),
  ]
);
