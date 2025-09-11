import { validate } from "class-validator";
import { AuthenticatedRequest } from "../middleware/auth";
import { Request, Response, NextFunction } from "express";
import { CreateSleepLogRequest } from "../requests/healthdata/CreateSleepLogRequest";
import SleepLog from "../models/Sleep";

//TODO need to check if stages (rem%, lightsleep %, deepsleep% amount to 100%)
//works by adding a custom validator with registerDecorator
export const createSleepLog = async (
  req: AuthenticatedRequest & {
    body: CreateSleepLogRequest;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { timestamp, duration, stages, source, heartRateDuringSleep } =
      req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    const sleepLog = new SleepLog({
      userId,
      timestamp: timestamp ?? Date.now(),
      duration,
      stages,
      source,
      heartRateDuringSleep,
    });

    //save sleep data in db
    await sleepLog.save();

    res.status(201).json({
      message: "Sleep log created successfully",
      sleepData: sleepLog,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
