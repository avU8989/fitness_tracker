import { AuthenticatedRequest } from "../middleware/auth";
import { Response, NextFunction } from "express";
import { CreatePulseOximeterLogRequest } from "../requests/healthdata/CreatePulseOximeterLogRequest";
import PulseOximeterLog from "../models/PulseOximeter";
import PhysicalActivityLog from "../models/PhysicalActivity";
import { CreatePhysicalActivityLogRequest } from "../requests/healthdata/CreatePhysicalActivityLogRequest";

export const createPhysicalActivityLog = async (
  req: AuthenticatedRequest & {
    body: CreatePhysicalActivityLogRequest;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { timestamp, steps, distance, energyExpended, source } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    const physicalActivityLog = new PhysicalActivityLog({
      userId: userId,
      timestamp: timestamp,
      steps: steps,
      distance: distance,
      energyExpended: energyExpended,
      source: source,
    });

    //save sleep data in db
    await physicalActivityLog.save();

    res.status(201).json({
      message: "Physical activity log created successfully",
      physicalActivityData: physicalActivityLog,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
