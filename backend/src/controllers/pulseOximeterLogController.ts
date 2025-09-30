import { AuthenticatedRequest } from "../middleware/auth";
import { Response, NextFunction } from "express";
import { CreatePulseOximeterLogRequest } from "../requests/healthdata/CreatePulseOximeterLogRequest";
import PulseOximeterLog from "../models/PulseOximeter";

export const createPulseOximeterLog = async (
  req: AuthenticatedRequest & {
    body: CreatePulseOximeterLogRequest;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { timestamp, spo2, bpm, source } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    const pulseOximeterLog = new PulseOximeterLog({
      userId,
      timestamp: timestamp,
      spo2,
      bpm,
      source,
    });

    //save sleep data in db
    await pulseOximeterLog.save();

    res.status(201).json({
      message: "Pulse oximeter log created successfully",
      pulseOximeterData: pulseOximeterLog,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
