import { Router } from "express";
import { getStatsOveriew } from "../controllers/statsController";
const statsRouter = Router();

statsRouter.get("/", getStatsOveriew);
export default statsRouter;
