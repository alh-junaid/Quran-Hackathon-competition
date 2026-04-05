import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  dailyVerseTarget: integer("daily_verse_target").notNull().default(5),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalVersesRead: integer("total_verses_read").notNull().default(0),
  totalDaysRead: integer("total_days_read").notNull().default(0),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const readingSessionsTable = pgTable("reading_sessions", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  versesRead: integer("verses_read").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true });
export const insertReadingSessionSchema = createInsertSchema(readingSessionsTable).omit({ id: true, createdAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
export type ReadingSession = typeof readingSessionsTable.$inferSelect;
