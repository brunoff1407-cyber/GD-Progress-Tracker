import { Router, type IRouter } from "express";
import healthRouter from "./health";
import levelsRouter from "./levels";
import statsRouter from "./stats";
import sessionsRouter from "./sessions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(levelsRouter);
router.use(statsRouter);
router.use(sessionsRouter);

export default router;
