import { Express, Router } from "express";
import { createTrainingPlan } from "../controllers/trainingPlanController";
import { updateExercise } from "../controllers/trainingPlanController";
import { getTrainingPlans } from "../controllers/trainingPlanController";
import authMiddleware from "../middleware/auth";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { validateCreateTrainingPlan } from "../middleware/validatePlan";

const trainingPlanRouter = Router();

//define routers and assign controller function
trainingPlanRouter.post(
  "/",
  validateCreateTrainingPlan,
  createTrainingPlan
);
trainingPlanRouter.patch("/:planId/exercises/:exerciseId", updateExercise);
trainingPlanRouter.get("/", authMiddleware, getTrainingPlans);

export default trainingPlanRouter;
