import mongoose, { Model, Schema, Types } from "mongoose";

export interface IHeartRateLog extends Document {
  userId: Types.ObjectId;
  timestamp: Date;
  bpm: number;
  source: "BLE" | "SMARTWATCH_API" | "MANUAL"; //BLE device, smartwatch API
}

const heartRateSchema = new Schema<IHeartRateLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  bpm: {
    type: Number,
    required: true,
    min: 20, // valid human HR range
    max: 250,
  },
  source: {
    type: String,
    enum: ["BLE", "SMARTWATCH_API", "MANUAL"],
    required: true,
  },
});

heartRateSchema.index({ userId: 1, timestamp: -1 });

const HeartRateLog: Model<IHeartRateLog> = mongoose.model<IHeartRateLog>(
  "HeartRateLog",
  heartRateSchema
);

export default HeartRateLog;
