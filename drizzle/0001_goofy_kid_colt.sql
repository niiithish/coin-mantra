CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"alert_name" text NOT NULL,
	"coin_id" text NOT NULL,
	"coin_name" text NOT NULL,
	"coin_symbol" text NOT NULL,
	"alert_type" text NOT NULL,
	"condition" text NOT NULL,
	"threshold_value" text NOT NULL,
	"frequency" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "watchlist" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "watchlist" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "watchlist" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "watchlist" ADD COLUMN "added_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alerts_userId_idx" ON "alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "alerts_coinId_idx" ON "alerts" USING btree ("coin_id");--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "watchlist_userId_idx" ON "watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watchlist_coinId_idx" ON "watchlist" USING btree ("coin_id");