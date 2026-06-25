import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import levelsRouter from "./levels";
import statsRouter from "./stats";
import sessionsRouter from "./sessions";
import { requireOwner } from "../middlewares/requireOwner";

const router: IRouter = Router();

// Public routes
router.use(healthRouter);
router.use(authRouter);

// Owner-only tracker data routes
router.use(requireOwner);
router.use(levelsRouter);
router.use(statsRouter);
router.use(sessionsRouter);

export default router;
