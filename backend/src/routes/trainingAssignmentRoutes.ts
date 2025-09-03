import { Router } from "express";
import {
  createTrainingPlanAssignment,
  getActivePlan,
} from "../controllers/trainingPlanAssignmentController";
import authMiddleware from "../middleware/auth";
const trainingAssignmentRouter = Router();

trainingAssignmentRouter.post("/", createTrainingPlanAssignment);
trainingAssignmentRouter.get("/active", getActivePlan);
export default trainingAssignmentRouter;
