import mongoose, { Model } from "mongoose";
import { Schema, Types, Document } from "mongoose";

export interface ITrainingPlanAssignment extends Document {
  user: Types.ObjectId;
  trainingPlan: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const trainingPlanAssignmentSchema = new Schema<ITrainingPlanAssignment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    trainingPlan: {
      type: Schema.Types.ObjectId,
      ref: "TrainingPlan",
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
  },
  { timestamps: true }
);

//useful for finding the next training plan assignment
trainingPlanAssignmentSchema.index({ user: 1, startDate: 1 });
//useful for finding active training plan assignment and overlap checks
trainingPlanAssignmentSchema.index({ user: 1, startDate: 1, endDate: 1 });

const TrainingPlanAssignment: Model<ITrainingPlanAssignment> =
  mongoose.model<ITrainingPlanAssignment>(
    "TrainingPlanAssignment",
    trainingPlanAssignmentSchema,
    "training_plan_assignments"
  );

export default TrainingPlanAssignment;
