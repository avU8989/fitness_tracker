import { Express, Router } from "express";
import { createTrainingPlan } from "../controllers/trainingPlanController";
import { updateExercise } from "../controllers/trainingPlanController";
import { getTrainingPlans } from "../controllers/trainingPlanController";
import authMiddleware from "../middleware/auth";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { CreateTrainingPlanRequest } from "../requests/trainingplans/CreateTrainingPlanRequest";

const trainingPlanRouter = Router();

//define routers and assign controller function
trainingPlanRouter.post(
  "/",
  validationMiddleware(CreateTrainingPlanRequest),
  createTrainingPlan
);
trainingPlanRouter.patch("/:planId/exercises/:exerciseId", updateExercise);
trainingPlanRouter.get("/", authMiddleware, getTrainingPlans);

export default trainingPlanRouter;
