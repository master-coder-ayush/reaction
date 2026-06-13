CREATE TABLE "mechanism_labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"mechanism_id" integer NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mechanism_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"mechanism_id" integer NOT NULL,
	"slot_key" varchar(32) NOT NULL,
	"correct_label" text NOT NULL,
	"pos_x" integer DEFAULT 50 NOT NULL,
	"pos_y" integer DEFAULT 50 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mechanisms" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"reaction_id" integer,
	"name" text NOT NULL,
	"mechanism_type" varchar(32) NOT NULL,
	"difficulty" integer DEFAULT 2 NOT NULL,
	"diagram_text" text NOT NULL,
	"story_text" text
);
--> statement-breakpoint
ALTER TABLE "user_stats" ADD COLUMN "best_timed_score" integer;--> statement-breakpoint
ALTER TABLE "mechanism_labels" ADD CONSTRAINT "mechanism_labels_mechanism_id_mechanisms_id_fk" FOREIGN KEY ("mechanism_id") REFERENCES "public"."mechanisms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mechanism_slots" ADD CONSTRAINT "mechanism_slots_mechanism_id_mechanisms_id_fk" FOREIGN KEY ("mechanism_id") REFERENCES "public"."mechanisms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mechanisms" ADD CONSTRAINT "mechanisms_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mechanisms" ADD CONSTRAINT "mechanisms_reaction_id_reactions_id_fk" FOREIGN KEY ("reaction_id") REFERENCES "public"."reactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mechanism_labels_mechanism_idx" ON "mechanism_labels" USING btree ("mechanism_id");--> statement-breakpoint
CREATE INDEX "mechanism_slots_mechanism_idx" ON "mechanism_slots" USING btree ("mechanism_id");