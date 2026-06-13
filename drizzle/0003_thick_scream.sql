CREATE TABLE "pathway_cards" (
	"user_id" integer NOT NULL,
	"pathway_id" integer NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pathway_cards_user_id_pathway_id_pk" PRIMARY KEY("user_id","pathway_id")
);
--> statement-breakpoint
CREATE TABLE "tree_edges" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"from_key" varchar(48) NOT NULL,
	"to_key" varchar(48) NOT NULL,
	"reagent_label" text NOT NULL,
	"color" varchar(32)
);
--> statement-breakpoint
CREATE TABLE "tree_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"node_key" varchar(48) NOT NULL,
	"compound_name" text NOT NULL,
	"color" varchar(32),
	"col" integer DEFAULT 0 NOT NULL,
	"row" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pathway_cards" ADD CONSTRAINT "pathway_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_cards" ADD CONSTRAINT "pathway_cards_pathway_id_reaction_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."reaction_pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_edges" ADD CONSTRAINT "tree_edges_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_nodes" ADD CONSTRAINT "tree_nodes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tree_edges_category_idx" ON "tree_edges" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tree_nodes_category_key_idx" ON "tree_nodes" USING btree ("category_id","node_key");--> statement-breakpoint
CREATE INDEX "tree_nodes_category_idx" ON "tree_nodes" USING btree ("category_id");