import mongoose, { Document, Model, Types, Schema } from "mongoose";
import { exerciseSchema, IExercise, ISet, setSchema } from "./Exercise";
import { string } from "joi";

export interface IPlanExercise {
  exercise: Types.ObjectId;
  sets: Types.DocumentArray<ISet>;
}

const planExerciseSchema = new Schema<IPlanExercise>(
  {
    exercise: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    sets: [setSchema],
  },
  { _id: false }
);

export interface IWorkoutDay extends Document {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  splitType: string;
  exercises: Types.DocumentArray<IPlanExercise>;
  createdAt?: Date;
  updatedAt?: Date;
}

export const workoutDaySchema = new Schema<IWorkoutDay>(
  {
    dayOfWeek: {
      type: String,
      enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      required: true,
    },
    splitType: { type: String, trim: true, required: true },
    exercises: [planExerciseSchema],
  },
  { timestamps: true }
);

export type TrainingPlanType = "Crossfit" | "Bodybuilding" | "Powerlifting";

export interface ITrainingPlan extends Document {
  name: string;
  type: TrainingPlanType;
  user: Types.ObjectId;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

//base Trainingplan using Discriminator to distinguish between different training plans
const trainingPlanBase = new Schema<ITrainingPlan>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["Crossfit", "Bodybuilding", "Powerlifting"],
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
    discriminatorKey: "type", //required for discriminator support in order to create Crossfit Trainingplan, Bodybuidling Trainingplan, etc
  }
);

const TrainingPlan: Model<ITrainingPlan> = mongoose.model<ITrainingPlan>(
  "TrainingPlan",
  trainingPlanBase,
  "training_plans"
);
export default TrainingPlan;
