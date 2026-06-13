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
