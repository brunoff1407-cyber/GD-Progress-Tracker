import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const levelsTable = pgTable("levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  creator: text("creator"),
  difficulty: text("difficulty").notNull(),
  stars: integer("stars"),
  bestPercent: integer("best_percent").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLevelSchema = createInsertSchema(levelsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type Level = typeof levelsTable.$inferSelect;
