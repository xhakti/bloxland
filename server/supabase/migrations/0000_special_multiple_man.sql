CREATE TYPE "public"."event_type" AS ENUM('MINI_GAMES', 'SOCIAL_QUEST', 'PARTNER_EVENTS');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('Partner', 'User');--> statement-breakpoint
CREATE TABLE "quest_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" text NOT NULL,
	"quest_id" uuid NOT NULL,
	"submission_link" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_address" text NOT NULL,
	"token_address" text NOT NULL,
	"token_symbol" text NOT NULL,
	"token_amount" numeric(20, 8) NOT NULL,
	"event_type" "event_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_quests" (
	"quest_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_address" text NOT NULL,
	"reward_token" text NOT NULL,
	"reward_amount" text NOT NULL,
	"reward_symbol" text NOT NULL,
	"quest_location" text NOT NULL,
	"energy_to_be_burned" text NOT NULL,
	"quest_name" text NOT NULL,
	"quest_description" text NOT NULL,
	"partner_name" text NOT NULL,
	"quest_winner" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_address" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"distance_travelled" numeric(20, 2) DEFAULT '0' NOT NULL,
	"checkpoints_conquered" integer DEFAULT 0 NOT NULL,
	"current_avatar_id" integer DEFAULT 1 NOT NULL,
	"purchased_avatar_ids" text[] DEFAULT '{"1"}' NOT NULL,
	"current_location" text,
	"sub_domain_name" text,
	"user_type" "user_type" DEFAULT 'User' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_address_unique" UNIQUE("user_address")
);
--> statement-breakpoint
ALTER TABLE "quest_submissions" ADD CONSTRAINT "quest_submissions_address_users_user_address_fk" FOREIGN KEY ("address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_submissions" ADD CONSTRAINT "quest_submissions_quest_id_social_quests_quest_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."social_quests"("quest_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_user_address_users_user_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_quests" ADD CONSTRAINT "social_quests_partner_address_users_user_address_fk" FOREIGN KEY ("partner_address") REFERENCES "public"."users"("user_address") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quest_submissions_address_quest_id_idx" ON "quest_submissions" USING btree ("address","quest_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_user_address_idx" ON "users" USING btree ("user_address");