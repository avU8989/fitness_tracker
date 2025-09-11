import { Router } from "express";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { CreateSleepLogRequest } from "../requests/healthdata/CreateSleepLogRequest";
import { createSleepLog } from "../controllers/sleepLogController";

const sleepLogRouter = Router();

sleepLogRouter.post(
  "/sleep",
  validationMiddleware(CreateSleepLogRequest),
  createSleepLog
);
export default sleepLogRouter;
