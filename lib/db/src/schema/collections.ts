import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const collectionsTable = sqliteTable("collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const collectionVersesTable = sqliteTable("collection_verses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  collectionId: integer("collection_id").notNull().references(() => collectionsTable.id, { onDelete: "cascade" }),
  verseKey: text("verse_key").notNull(),
  surahNumber: integer("surah_number").notNull(),
  surahName: text("surah_name").notNull(),
  verseNumber: integer("verse_number").notNull(),
  textUthmani: text("text_uthmani"),
  translation: text("translation"),
  addedAt: text("added_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCollectionSchema = createInsertSchema(collectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCollectionVerseSchema = createInsertSchema(collectionVersesTable).omit({ id: true, addedAt: true });
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collectionsTable.$inferSelect;
export type CollectionVerse = typeof collectionVersesTable.$inferSelect;
