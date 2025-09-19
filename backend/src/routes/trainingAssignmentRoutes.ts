import { Router } from "express";
import {
  getActivePlan,
  postTrainingPlanAssignment,
} from "../controllers/trainingPlanAssignmentController";
import authMiddleware from "../middleware/auth";
const trainingAssignmentRouter = Router();

trainingAssignmentRouter.post("/", postTrainingPlanAssignment);
trainingAssignmentRouter.get("/active", getActivePlan);
export default trainingAssignmentRouter;
