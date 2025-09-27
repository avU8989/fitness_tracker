import { Express } from "express";
import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  getWorkoutLogs,
  postWorkoutLog,
  getNextSkippedDay,
} from "../controllers/workoutController";

const workoutRouter = Router();

workoutRouter.post("/", postWorkoutLog);
workoutRouter.get("/", getWorkoutLogs);
workoutRouter.get("/next-skipped", getNextSkippedDay);

export default workoutRouter;
