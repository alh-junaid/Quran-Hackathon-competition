import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const bookmarksTable = sqliteTable("bookmarks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  verseKey: text("verse_key").notNull(),
  surahNumber: integer("surah_number").notNull(),
  surahName: text("surah_name").notNull(),
  verseNumber: integer("verse_number").notNull(),
  textUthmani: text("text_uthmani"),
  translation: text("translation"),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertBookmarkSchema = createInsertSchema(bookmarksTable).omit({ id: true, createdAt: true });
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarksTable.$inferSelect;
