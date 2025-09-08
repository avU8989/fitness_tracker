import { Express } from "express";
import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  getWorkoutLogs,
  createWorkoutLog,
} from "../controllers/workoutController";

const workoutRouter = Router();

workoutRouter.post("/", authMiddleware, createWorkoutLog);
workoutRouter.get("/", authMiddleware, getWorkoutLogs);

export default workoutRouter;
