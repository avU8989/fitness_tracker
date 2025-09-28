import { Express } from "express";
import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  getWorkoutLogs,
  postWorkoutLog,
  getNextSkippedWorkoutDay,
  getUpcomingWorkoutDay,
} from "../controllers/workoutController";

const workoutRouter = Router();

workoutRouter.post("/", postWorkoutLog);
workoutRouter.get("/", getWorkoutLogs);
workoutRouter.get("/next-skipped", getNextSkippedWorkoutDay);
workoutRouter.get("/next-upcoming", getUpcomingWorkoutDay);

export default workoutRouter;
