CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"requirement_type" varchar(32) NOT NULL,
	"requirement_value" integer DEFAULT 0 NOT NULL,
	"color" varchar(32)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"class_level" varchar(8) NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"reaction_id" integer NOT NULL,
	"challenge_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"period_type" varchar(16) NOT NULL,
	"period_key" varchar(16) NOT NULL,
	"rank" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathway_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"pathway_id" integer NOT NULL,
	"step_order" integer NOT NULL,
	"compound_name" text NOT NULL,
	"reagent_used" text,
	"reaction_type_id" integer
);
--> statement-breakpoint
CREATE TABLE "reaction_cards" (
	"user_id" integer NOT NULL,
	"reaction_id" integer NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reaction_cards_user_id_reaction_id_pk" PRIMARY KEY("user_id","reaction_id")
);
--> statement-breakpoint
CREATE TABLE "reaction_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"reaction_id" integer NOT NULL,
	"option_type" varchar(16) NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reaction_pathways" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"class_level" varchar(8) NOT NULL,
	"category_id" integer,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "reaction_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" varchar(32) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category_id" integer NOT NULL,
	"reaction_type_id" integer NOT NULL,
	"board" varchar(16) DEFAULT 'Both' NOT NULL,
	"class_level" varchar(8) NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"question_text" text NOT NULL,
	"equation_text" text,
	"hint_wrong_reagent" text,
	"hint_wrong_product" text,
	"hint_wrong_reactant" text,
	"story_text" text,
	"why_text" text,
	"is_name_reaction" boolean DEFAULT false NOT NULL,
	"name_reaction_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_badges_user_id_badge_id_pk" PRIMARY KEY("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" integer NOT NULL,
	"reaction_id" integer NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"last_attempted" timestamp with time zone,
	"mastered" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_progress_user_id_reaction_id_pk" PRIMARY KEY("user_id","reaction_id")
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streak_current" integer DEFAULT 0 NOT NULL,
	"streak_longest" integer DEFAULT 0 NOT NULL,
	"streak_freeze_count" integer DEFAULT 0 NOT NULL,
	"last_activity_date" date,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_attempts" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" varchar(32) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"password_hash" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"class_level" varchar(8) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_reaction_id_reactions_id_fk" FOREIGN KEY ("reaction_id") REFERENCES "public"."reactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_steps" ADD CONSTRAINT "pathway_steps_pathway_id_reaction_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."reaction_pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_steps" ADD CONSTRAINT "pathway_steps_reaction_type_id_reaction_types_id_fk" FOREIGN KEY ("reaction_type_id") REFERENCES "public"."reaction_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction_cards" ADD CONSTRAINT "reaction_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction_cards" ADD CONSTRAINT "reaction_cards_reaction_id_reactions_id_fk" FOREIGN KEY ("reaction_id") REFERENCES "public"."reactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction_options" ADD CONSTRAINT "reaction_options_reaction_id_reactions_id_fk" FOREIGN KEY ("reaction_id") REFERENCES "public"."reactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction_pathways" ADD CONSTRAINT "reaction_pathways_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_reaction_type_id_reaction_types_id_fk" FOREIGN KEY ("reaction_type_id") REFERENCES "public"."reaction_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_reaction_id_reactions_id_fk" FOREIGN KEY ("reaction_id") REFERENCES "public"."reactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_challenges_date_idx" ON "daily_challenges" USING btree ("challenge_date");--> statement-breakpoint
CREATE UNIQUE INDEX "leaderboard_user_period_idx" ON "leaderboard_snapshots" USING btree ("user_id","period_type","period_key");--> statement-breakpoint
CREATE INDEX "leaderboard_period_idx" ON "leaderboard_snapshots" USING btree ("period_type","period_key");--> statement-breakpoint
CREATE INDEX "pathway_steps_pathway_idx" ON "pathway_steps" USING btree ("pathway_id");--> statement-breakpoint
CREATE INDEX "reaction_options_reaction_idx" ON "reaction_options" USING btree ("reaction_id");--> statement-breakpoint
CREATE INDEX "reactions_category_idx" ON "reactions" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");