import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, goalsTable, readingSessionsTable } from "@workspace/db";
import {
  UpsertGoalBody,
  LogReadingSessionBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateGoal() {
  const [existing] = await db.select().from(goalsTable).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(goalsTable).values({ dailyVerseTarget: 5 }).returning();
  return created;
}

router.get("/goals", async (_req, res): Promise<void> => {
  const goal = await getOrCreateGoal();
  res.json(goal);
});

router.post("/goals", async (req, res): Promise<void> => {
  const parsed = UpsertGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await getOrCreateGoal();
  const [goal] = await db
    .update(goalsTable)
    .set({ dailyVerseTarget: parsed.data.dailyVerseTarget })
    .where(eq(goalsTable.id, existing.id))
    .returning();

  res.json(goal);
});

router.post("/goals/log", async (req, res): Promise<void> => {
  const parsed = LogReadingSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const goal = await getOrCreateGoal();

  const [existingSession] = await db
    .select()
    .from(readingSessionsTable)
    .where(eq(readingSessionsTable.date, today));

  if (existingSession) {
    await db
      .update(readingSessionsTable)
      .set({ versesRead: existingSession.versesRead + parsed.data.versesRead })
      .where(eq(readingSessionsTable.date, today));
  } else {
    await db.insert(readingSessionsTable).values({
      date: today,
      versesRead: parsed.data.versesRead,
    });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const [yesterdaySession] = await db
    .select()
    .from(readingSessionsTable)
    .where(eq(readingSessionsTable.date, yesterdayStr));

  let newStreak = goal.currentStreak;
  const lastReadAt = goal.lastReadAt;
  const lastReadDate = lastReadAt
    ? new Date(lastReadAt).toISOString().split("T")[0]
    : null;

  if (lastReadDate === today) {
    // already read today, keep streak
  } else if (lastReadDate === yesterdayStr || !lastReadDate || yesterdaySession) {
    newStreak = goal.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(goal.longestStreak, newStreak);
  const newTotal = goal.totalVersesRead + parsed.data.versesRead;
  const newDays = lastReadDate === today ? goal.totalDaysRead : goal.totalDaysRead + 1;

  const [updatedGoal] = await db
    .update(goalsTable)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalVersesRead: newTotal,
      totalDaysRead: newDays,
      lastReadAt: new Date(),
    })
    .where(eq(goalsTable.id, goal.id))
    .returning();

  res.json(updatedGoal);
});

router.get("/goals/streak", async (_req, res): Promise<void> => {
  const goal = await getOrCreateGoal();

  const sessions = await db
    .select()
    .from(readingSessionsTable)
    .orderBy(desc(readingSessionsTable.date))
    .limit(30);

  const sessionMap = new Map(sessions.map(s => [s.date, s.versesRead]));

  const recentDays = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const versesRead = sessionMap.get(dateStr) ?? 0;
    recentDays.push({ date: dateStr, versesRead, read: versesRead > 0 });
  }

  res.json({
    currentStreak: goal.currentStreak,
    longestStreak: goal.longestStreak,
    totalDaysRead: goal.totalDaysRead,
    lastReadAt: goal.lastReadAt,
    recentDays,
  });
});

export default router;
