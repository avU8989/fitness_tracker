import { Express, Router } from "express";
import { createTrainingPlan } from "../controllers/trainingPlanController";
import { updateExercise } from "../controllers/trainingPlanController";
import { getTrainingPlans } from "../controllers/trainingPlanController";
import authMiddleware from "../middleware/auth";

const trainingPlanRouter = Router();

//define routers and assign controller function
trainingPlanRouter.post("/", createTrainingPlan);
trainingPlanRouter.patch("/:planId/exercises/:exerciseId", updateExercise);
trainingPlanRouter.get("/", authMiddleware, getTrainingPlans);

export default trainingPlanRouter;
