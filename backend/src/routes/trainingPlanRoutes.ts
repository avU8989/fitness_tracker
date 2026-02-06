import { Express, Router } from "express";
import {
  deleteTrainingPlan,
  getTotalPlans,
  getWorkoutTemplatesFromTrainingPlan,
  patchExercise,
  postTrainingPlan,
  postWorkoutTemplateInTrainingPlan,
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
trainingPlanRouter.post("/:planId/workout-templates", postWorkoutTemplateInTrainingPlan);
trainingPlanRouter.get("/:planId/workout-templates", getWorkoutTemplatesFromTrainingPlan);

export default trainingPlanRouter;
