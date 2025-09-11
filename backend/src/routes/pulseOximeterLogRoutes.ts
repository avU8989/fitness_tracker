import { Router } from "express";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { CreatePulseOximeterLogRequest } from "../requests/healthdata/CreatePulseOximeterLogRequest";
import { createPulseOximeterLog } from "../controllers/pulseOximeterLogController";

const pulseOximeterLogRouter = Router();

pulseOximeterLogRouter.post(
  "/pulse-oximter",
  validationMiddleware(CreatePulseOximeterLogRequest),
  createPulseOximeterLog
);

export default pulseOximeterLogRouter;
