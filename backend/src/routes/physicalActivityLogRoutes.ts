import { Router } from "express";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { CreatePhysicalActivityLogRequest } from "../requests/healthdata/CreatePhysicalActivityLogRequest";
import { createPhysicalActivityLog } from "../controllers/physicalActivityLogController";

const physicalActivityLogRouter = Router();

physicalActivityLogRouter.post(
  "/physical-activity",
  validationMiddleware(CreatePhysicalActivityLogRequest),
  createPhysicalActivityLog
);
export default physicalActivityLogRouter;
