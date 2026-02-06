import { postWorkoutTemplate } from "../controllers/workoutTemplateController";
import { Express } from "express";
import { Router } from "express";

const workoutTemplatesRouter = Router();

workoutTemplatesRouter.post("/", postWorkoutTemplate);

export default workoutTemplatesRouter;