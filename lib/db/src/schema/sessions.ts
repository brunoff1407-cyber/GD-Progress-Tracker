import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { levelsTable } from "./levels";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  levelId: integer("level_id")
    .notNull()
    .references(() => levelsTable.id, { onDelete: "cascade" }),
  attempts: integer("attempts").notNull().default(0),
  bestPercent: integer("best_percent").notNull().default(0),
  notes: text("notes"),
  sessionDate: timestamp("session_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Session = typeof sessionsTable.$inferSelect;
