CREATE TABLE "avatars" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"rarity" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
