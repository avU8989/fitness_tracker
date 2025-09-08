import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface ISet extends Document {
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
}

const setSchema = new Schema<ISet>(
  {
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
    unit: {
      type: String,
      enum: ["kg", "lbs"],
      default: "kg",
    },
  },
  { _id: false }
);

export interface IExercise extends Document {
  name: string;
  sets: Types.DocumentArray<ISet>;
  createdAt?: Date;
  updatedAt?: Date;
}

const exerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true },
    sets: [setSchema],
  },
  { timestamps: true }
);

export interface IWorkoutDay extends Document {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  splitType: string;
  exercises: Types.DocumentArray<IExercise>;
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
    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

type TrainingPlanType = "Crossfit" | "Bodybuilding" | "Powerlifting";

export interface ITrainingPlan extends Document {
  name: string;
  type: TrainingPlanType;
  user: Types.ObjectId;
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
  },
  {
    timestamps: true,
    discriminatorKey: "type", //required for discriminator support in order to create Crossfit Trainingplan, Bodybuidling Trainingplan, etc
  }
);

const TrainingPlan: Model<ITrainingPlan> = mongoose.model<ITrainingPlan>(
  "TrainingPlan",
  trainingPlanBase
);
export default TrainingPlan;
