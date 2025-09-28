import { Express, Router } from "express";
import {
  deleteTrainingPlan,
  getTotalPlans,
  patchExercise,
  postTrainingPlan,
  putWorkoutDay,
} from "../controllers/trainingPlanController";
import { getTrainingPlans } from "../controllers/trainingPlanController";
import authMiddleware from "../middleware/auth";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { validateCreateTrainingPlan } from "../middleware/validatePlan";

const trainingPlanRouter = Router();

//define routers and assign controller function
trainingPlanRouter.post("/", validateCreateTrainingPlan, postTrainingPlan);
trainingPlanRouter.get("/", getTrainingPlans);
trainingPlanRouter.delete("/:planId", deleteTrainingPlan);

//Sub-resources
trainingPlanRouter.patch("/:planId/exercises/:exerciseId", patchExercise);
trainingPlanRouter.put("/:planId/days/:dayId", putWorkoutDay);
trainingPlanRouter.get("/total", getTotalPlans);

export default trainingPlanRouter;
