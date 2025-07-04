import mongoose, { Document, Model, Types, Schema } from "mongoose";

export interface IExercise extends Document {
  name: string;
  sets: number;
  repetitions: number;
  weight: number;
  unit: "kg" | "lbs";
  createdAt?: Date;
  updatedAt?: Date;
}

const exerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    repetitions: { type: Number, required: true },
    weight: { type: Number, required: true },
    unit: {
      type: String,
      enum: ["kg", "lbs"],
      required: true,
    },
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

const workoutDaySchema = new Schema<IWorkoutDay>(
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

export interface ITrainingPlan extends Document {
  name: string;
  days: Types.DocumentArray<IWorkoutDay>;
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const trainingPlanSchema = new Schema<ITrainingPlan>(
  {
    name: { type: String, required: true },
    days: [workoutDaySchema],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const TrainingPlan: Model<ITrainingPlan> = mongoose.model<ITrainingPlan>(
  "TrainingPlan",
  trainingPlanSchema
);
export default TrainingPlan;
