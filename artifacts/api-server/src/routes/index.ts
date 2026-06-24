import { Router, type IRouter } from "express";
import healthRouter from "./health";
import levelsRouter from "./levels";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(levelsRouter);
router.use(statsRouter);

export default router;
