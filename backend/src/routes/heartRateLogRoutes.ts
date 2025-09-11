import { Router } from "express";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { CreateHeartRateLogRequest } from "../requests/healthdata/CreateHeartRateLogRequest";
import { createHeartRateLog } from "../controllers/heartRateLogController";
const heartRateLogRouter = Router();

heartRateLogRouter.post(
  "/heartrate",
  validationMiddleware(CreateHeartRateLogRequest),
  createHeartRateLog
);

export default heartRateLogRouter;
