import { timeStamp } from "console";
import mongoose, { Model, Schema, Types } from "mongoose";
export interface IPulseOximeterLog extends Document {
  userId: Types.ObjectId;
  timestamp: Date;
  spo2: number;
  bpm?: number;
  source: "BLE" | "SMARTWATCH_API" | "MANUAL"; //BLE device, smartwatch API
}

const pulseOximeterSchema = new Schema<IPulseOximeterLog>({
  userId: { type: Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
  spo2: {
    type: Number,
    required: true,
    min: 50, // physiologically impossible below this
    max: 100, // SpO₂ can't be > 100%
  },
  bpm: { type: Number },
  source: {
    type: String,
    enum: ["BLE", "SMARTWATCH_API", "MANUAL"],
    required: true,
  },
});

pulseOximeterSchema.index({ userId: 1, timestamp: -1 });

const PulseOximeterLog: Model<IPulseOximeterLog> =
  mongoose.model<IPulseOximeterLog>("PulseOximeterLog", pulseOximeterSchema);

export default PulseOximeterLog;
