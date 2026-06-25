import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
// Named "auth_sessions" to avoid colliding with the practice-session "sessions" table.
export const authSessionsTable = pgTable(
  "auth_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_auth_session_expire").on(table.expire)],
);

// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const usersTable = pgTable(
  "users",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email").unique(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    isOwner: boolean("is_owner").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  // Enforce at most one owner at the database level, so concurrent first-login
  // owner-claims cannot create multiple owners.
  (table) => [
    uniqueIndex("IDX_users_single_owner")
      .on(table.isOwner)
      .where(sql`${table.isOwner} = true`),
  ],
);

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
