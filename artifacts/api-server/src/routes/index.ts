import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quranRouter from "./quran";
import bookmarksRouter from "./bookmarks";
import notesRouter from "./notes";
import goalsRouter from "./goals";
import collectionsRouter from "./collections";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quranRouter);
router.use(bookmarksRouter);
router.use(notesRouter);
router.use(goalsRouter);
router.use(collectionsRouter);
router.use(dashboardRouter);

export default router;
