import mongoose, { Model, Schema, Types } from "mongoose";

export interface ISleepLog {
  userId: Types.ObjectId;
  date: Date;
  duration: number;
  stages: {
    rem: number; // % in REM
    light: number; // % Light sleep
    deep: number; // % Deep sleep
  };
  source: "BLE" | "SMARTWATCH_API" | "MANUAL"; //BLE device, smartwatch API
  heartRateDuringSleep: number;
}

const sleepSchema = new Schema<ISleepLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  duration: { type: Number, required: true },
  stages: {
    rem: { type: Number, default: 0, required: true },
    light: { type: Number, default: 0, required: true },
    deep: { type: Number, default: 0, required: true },
  },
  source: {
    type: String,
    enum: ["BLE", "SMARTWATCH_API", "MANUAL"],
    required: true,
  },
  heartRateDuringSleep: { type: Number, required: true },
});

sleepSchema.index({ userId: 1, date: -1 });

const SleepLog: Model<ISleepLog> = mongoose.model<ISleepLog>(
  "SleepLog",
  sleepSchema
);

export default SleepLog;
