import { Router } from "express";
import {
  getStatsOveriew,
  getStatsProgress,
} from "../controllers/statsController";
const statsRouter = Router();

statsRouter.get("/overview", getStatsOveriew);
statsRouter.get("/progress", getStatsProgress);
export default statsRouter;
