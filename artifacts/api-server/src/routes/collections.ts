import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, collectionsTable, collectionVersesTable } from "@workspace/db";
import {
  CreateCollectionBody,
  GetCollectionParams,
  UpdateCollectionParams,
  UpdateCollectionBody,
  DeleteCollectionParams,
  AddVerseToCollectionParams,
  AddVerseToCollectionBody,
  RemoveVerseFromCollectionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getCollectionWithVerses(id: number) {
  const [collection] = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.id, id));
  if (!collection) return null;

  const verses = await db
    .select()
    .from(collectionVersesTable)
    .where(eq(collectionVersesTable.collectionId, id))
    .orderBy(collectionVersesTable.addedAt);

  return { ...collection, verseCount: verses.length, verses };
}

router.get("/collections", async (_req, res): Promise<void> => {
  try {
    const collections = await db.select().from(collectionsTable).orderBy(collectionsTable.createdAt);

    const withCounts = await Promise.all(
      collections.map(async (c) => {
        const [{ count: verseCount }] = await db
          .select({ count: count() })
          .from(collectionVersesTable)
          .where(eq(collectionVersesTable.collectionId, c.id));
        return { ...c, verseCount: Number(verseCount), verses: [] };
      })
    );

    res.json(withCounts);
  } catch(err) {
    res.json([]);
  }
});

router.post("/collections", async (req, res): Promise<void> => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [collection] = await db
    .insert(collectionsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json({ ...collection, verseCount: 0, verses: [] });
});

router.get("/collections/:id", async (req, res): Promise<void> => {
  const params = GetCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const collection = await getCollectionWithVerses(params.data.id);
    if (!collection) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    res.json(collection);
  } catch(err) {
    res.status(404).json({ error: "Collection not found" });
  }
});

router.patch("/collections/:id", async (req, res): Promise<void> => {
  const params = UpdateCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<{ name: string; description: string | null; updatedAt: Date }> = {
    updatedAt: new Date(),
  };
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;

  await db
    .update(collectionsTable)
    .set(updates)
    .where(eq(collectionsTable.id, params.data.id));

  const collection = await getCollectionWithVerses(params.data.id);
  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  res.json(collection);
});

router.delete("/collections/:id", async (req, res): Promise<void> => {
  const params = DeleteCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(collectionsTable).where(eq(collectionsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/collections/:id/verses", async (req, res): Promise<void> => {
  const params = AddVerseToCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddVerseToCollectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(collectionVersesTable)
    .where(eq(collectionVersesTable.collectionId, params.data.id));

  const alreadyIn = existing.find(v => v.verseKey === parsed.data.verseKey);
  if (!alreadyIn) {
    await db.insert(collectionVersesTable).values({
      collectionId: params.data.id,
      ...parsed.data,
    });
  }

  const collection = await getCollectionWithVerses(params.data.id);
  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  res.json(collection);
});

router.delete("/collections/:id/verses/:verseKey", async (req, res): Promise<void> => {
  const params = RemoveVerseFromCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(collectionVersesTable)
    .where(eq(collectionVersesTable.collectionId, params.data.id));

  res.sendStatus(204);
});

export default router;
