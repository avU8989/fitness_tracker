import { Router } from "express";
import {
  deleteTrainingPlanAssignment,
  getActivePlan,
  postTrainingPlanAssignment,
} from "../controllers/trainingPlanAssignmentController";
import authMiddleware from "../middleware/auth";
const trainingAssignmentRouter = Router();

trainingAssignmentRouter.post("/", postTrainingPlanAssignment);
trainingAssignmentRouter.get("/active", getActivePlan);
trainingAssignmentRouter.delete("/:planId", deleteTrainingPlanAssignment);
export default trainingAssignmentRouter;
