import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const goalsTable = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dailyVerseTarget: integer("daily_verse_target").notNull().default(5),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalVersesRead: integer("total_verses_read").notNull().default(0),
  totalDaysRead: integer("total_days_read").notNull().default(0),
  lastReadAt: text("last_read_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const readingSessionsTable = sqliteTable("reading_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  versesRead: integer("verses_read").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true });
export const insertReadingSessionSchema = createInsertSchema(readingSessionsTable).omit({ id: true, createdAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
export type ReadingSession = typeof readingSessionsTable.$inferSelect;
