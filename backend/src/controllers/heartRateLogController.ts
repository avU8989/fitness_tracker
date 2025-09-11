import { validate } from "class-validator";
import { AuthenticatedRequest } from "../middleware/auth";
import { CreateHeartRateLogRequest } from "../requests/healthdata/CreateHeartRateLogRequest";
import { Request, Response, NextFunction } from "express";
import HeartRateLog from "../models/HeartRate";

export const createHeartRateLog = async (
  req: AuthenticatedRequest & {
    body: CreateHeartRateLogRequest;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { timestamp, bpm, source } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    const heartRateLog = new HeartRateLog({
      userId,
      timestamp: timestamp,
      bpm,
      source,
    });

    //save heartrate data in db
    await heartRateLog.save();

    res.status(201).json({
      message: "Heart rate log created successfully",
      heartRateData: heartRateLog,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
