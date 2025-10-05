import { validate } from "class-validator";
import { AuthenticatedRequest } from "../middleware/auth";
import { CreateHeartRateLogRequest } from "../requests/healthdata/CreateHeartRateLogRequest";
import { Request, Response, NextFunction } from "express";
import HeartRateLog from "../models/HeartRate";
import { logIngest } from "@utils/logger-helper";

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

    //log incoming heart-rate payload before saving
    logIngest({
      user_id: userId,
      device_id: source || "unknown-device",
      seq: req.body.seq || "", // optional: include sequence number if BLE sends one
      hr: bpm,
      accepted: true, // later you can set false for invalid payloads
      reason: "received via /healthdata/heart-rate endpoint",
      raw_body: req.body
    });

    //save heartrate data in db
    await heartRateLog.save();

    res.status(201).json({
      message: "Heart rate log created successfully",
      heartRateData: heartRateLog,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
