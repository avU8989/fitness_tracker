import mongoose, { Model, Schema, Types } from "mongoose";

export interface IPhysicalActivityLog extends Document {
  userId: Types.ObjectId;
  timestamp: Date;
  steps: number;
  distance?: number; //in meters
  energyExpended?: number; //in kJ
  source: "BLE" | "SMARTWATCH_API" | "MANUAL"; //BLE device, smartwatch API
}

const activitySchema = new Schema<IPhysicalActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  steps: { type: Number, required: true, min: 0 },
  distance: { type: Number, min: 0 }, // optional
  energyExpended: { type: Number, min: 0 }, // optional
  source: {
    type: String,
    enum: ["BLE", "SMARTWATCH_API", "MANUAL"],
    required: true,
  },
});

activitySchema.index({ userId: 1, timestamp: -1 });

const PhysicalActivityLog: Model<IPhysicalActivityLog> =
  mongoose.model<IPhysicalActivityLog>(
    "PhysicalActivityLog",
    activitySchema,
    "physical_activity_logs"
  );

export default PhysicalActivityLog;
