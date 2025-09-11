import mongoose, { Model, Schema, Types } from "mongoose";

export interface IActivityLog extends Document {
  userId: Types.ObjectId;
  date: Date;
  steps: number;
  distance?: number; //in meters
  energyExpended?: number; //in kJ
  source: "BLE" | "SMARTWATCH_API" | "MANUAL"; //BLE device, smartwatch API
}

const activitySchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  steps: { type: Number, required: true, min: 0 },
  distance: { type: Number, min: 0 }, // optional
  energyExpended: { type: Number, min: 0 }, // optional
  source: {
    type: String,
    enum: ["BLE", "SMARTWATCH_API", "MANUAL"],
    required: true,
  },
});

activitySchema.index({ userId: 1, date: -1 });

const ActivityLog: Model<IActivityLog> = mongoose.model<IActivityLog>(
  "ActivityLog",
  activitySchema
);

export default ActivityLog;
