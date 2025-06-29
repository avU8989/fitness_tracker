import { Express } from "express";
import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { getWorkouts, createWorkout } from "../controllers/workoutController";

const workoutRouter = Router();

workoutRouter.post("/workouts", authMiddleware, createWorkout);
workoutRouter.get("/workouts", authMiddleware, getWorkouts);

export default workoutRouter;
