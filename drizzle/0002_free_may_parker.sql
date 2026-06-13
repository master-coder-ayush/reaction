CREATE TABLE "boss_attempts" (
	"user_id" integer NOT NULL,
	"chapter" integer NOT NULL,
	"attempt_date" date NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "boss_attempts_user_id_chapter_attempt_date_pk" PRIMARY KEY("user_id","chapter","attempt_date")
);
--> statement-breakpoint
CREATE TABLE "escape_room_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"class_level" varchar(8) NOT NULL,
	"seconds" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_stats" ADD COLUMN "escape_best_seconds" integer;--> statement-breakpoint
ALTER TABLE "boss_attempts" ADD CONSTRAINT "boss_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escape_room_results" ADD CONSTRAINT "escape_room_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "escape_room_results_user_idx" ON "escape_room_results" USING btree ("user_id");