import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Watchlist table - stores user's coin watchlist
export const watchlist = pgTable(
  "watchlist",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    coinId: text("coin_id").notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => [
    index("watchlist_userId_idx").on(table.userId),
    index("watchlist_coinId_idx").on(table.coinId),
  ]
);

// Alerts table - stores price alerts for coins
export const alerts = pgTable(
  "alerts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    alertName: text("alert_name").notNull(),
    coinId: text("coin_id").notNull(),
    coinName: text("coin_name").notNull(),
    coinSymbol: text("coin_symbol").notNull(),
    alertType: text("alert_type").notNull(),
    condition: text("condition").notNull(),
    thresholdValue: text("threshold_value").notNull(),
    frequency: text("frequency").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("alerts_userId_idx").on(table.userId),
    index("alerts_coinId_idx").on(table.coinId),
  ]
);

// Relations
export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(user, {
    fields: [watchlist.userId],
    references: [user.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(user, {
    fields: [alerts.userId],
    references: [user.id],
  }),
}));
