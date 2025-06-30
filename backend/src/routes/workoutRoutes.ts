import { Express } from "express";
import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  getWorkoutLogs,
  createWorkoutLog,
} from "../controllers/workoutController";

const workoutRouter = Router();

workoutRouter.post("/workouts", authMiddleware, createWorkoutLog);
workoutRouter.get("/workouts", authMiddleware, getWorkoutLogs);

export default workoutRouter;
