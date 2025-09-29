import { Router } from "express";
import { getDashboardOverview } from "../controllers/dashboardController";

const dashboardRouter = Router();

dashboardRouter.get("/overview", getDashboardOverview);

export default dashboardRouter;
