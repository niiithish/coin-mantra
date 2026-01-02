import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "./auth-schema";
import { usersTable, watchlist } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    user,
    session,
    account,
    verification,
    userRelations,
    sessionRelations,
    accountRelations,
    usersTable,
    watchlist,
  },
});
