import { Router, type IRouter } from "express";
import { desc, count } from "drizzle-orm";
import { db, bookmarksTable, notesTable, collectionsTable, goalsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [bookmarksCount] = await db.select({ count: count() }).from(bookmarksTable);
  const [notesCount] = await db.select({ count: count() }).from(notesTable);
  const [collectionsCount] = await db.select({ count: count() }).from(collectionsTable);

  const [goal] = await db.select().from(goalsTable).limit(1);

  const recentBookmarks = await db
    .select()
    .from(bookmarksTable)
    .orderBy(desc(bookmarksTable.createdAt))
    .limit(5);

  const recentNotes = await db
    .select()
    .from(notesTable)
    .orderBy(desc(notesTable.updatedAt))
    .limit(5);

  res.json({
    totalBookmarks: Number(bookmarksCount.count),
    totalNotes: Number(notesCount.count),
    totalCollections: Number(collectionsCount.count),
    currentStreak: goal?.currentStreak ?? 0,
    longestStreak: goal?.longestStreak ?? 0,
    totalVersesRead: goal?.totalVersesRead ?? 0,
    dailyVerseTarget: goal?.dailyVerseTarget ?? 5,
    lastReadAt: goal?.lastReadAt ?? null,
    recentBookmarks,
    recentNotes,
  });
});

export default router;
