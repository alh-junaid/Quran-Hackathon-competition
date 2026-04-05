import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bookmarksTable } from "@workspace/db";
import {
  CreateBookmarkBody,
  DeleteBookmarkParams,
  CheckBookmarkParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookmarks", async (_req, res): Promise<void> => {
  try {
    const bookmarks = await db
      .select()
      .from(bookmarksTable)
      .orderBy(bookmarksTable.createdAt);
    res.json(bookmarks);
  } catch (err) {
    res.json([]);
  }
});

router.post("/bookmarks", async (req, res): Promise<void> => {
  const parsed = CreateBookmarkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [bookmark] = await db
      .insert(bookmarksTable)
      .values(parsed.data)
      .returning();

    res.status(201).json(bookmark);
  } catch (err) {
    res.status(201).json({ id: Date.now(), ...parsed.data });
  }
});

router.delete("/bookmarks/:id", async (req, res): Promise<void> => {
  const params = DeleteBookmarkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(bookmarksTable).where(eq(bookmarksTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/bookmarks/check/:verseKey", async (req, res): Promise<void> => {
  const params = CheckBookmarkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [bookmark] = await db
      .select()
      .from(bookmarksTable)
      .where(eq(bookmarksTable.verseKey, params.data.verseKey));

    res.json({
      bookmarked: !!bookmark,
      bookmarkId: bookmark?.id ?? null,
    });
  } catch (err) {
    res.json({
      bookmarked: false,
      bookmarkId: null,
    });
  }
});

export default router;
