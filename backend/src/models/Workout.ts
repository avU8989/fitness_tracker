import mongoose, { Document, Types, Schema, Model } from "mongoose";
import { IExercise, ISet, setSchema } from "./TrainingPlan";

export interface IExerciseLog {
  exerciseId?: Types.ObjectId;
  name: string;
  sets: ISet[];
  rpe?: number;
}

//for snapshots
const exerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true },
    sets: { type: [setSchema], _id: false }, // snapshot sets won't need _id
  },
  { timestamps: true }
);

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  trainingPlanId?: Types.ObjectId;
  workoutDayId?: Types.ObjectId;
  // Snapshots (at time of logging)
  dayOfWeek?: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  splitType?: string;
  plannedExercises?: IExercise[]; // snapshot of planned exercises
  performed: Date;
  exercises: IExerciseLog[];
  duration?: number;
  caloriesBurned?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const exerciseLogSchema = new Schema<IExerciseLog>({
  exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
  name: { type: String, required: true },
  sets: { type: [setSchema], required: true },
  rpe: { type: Number },
});

const workoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trainingPlanId: {
      type: Schema.Types.ObjectId,
      ref: "TrainingPlan",
    },
    workoutDayId: {
      type: Schema.Types.ObjectId,
    },
    //snapshot at the time of logging
    dayOfWeek: {
      type: String,
      enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    },
    splitType: { type: String },
    plannedExercises: [exerciseSchema],
    performed: { type: Date, required: true },
    exercises: [exerciseLogSchema],
    duration: Number,
    caloriesBurned: Number,
    notes: String,
  },
  { timestamps: true }
);

//ensure uniqueness
workoutLogSchema.index(
  { userId: 1, trainingPlanId: 1, performed: 1 },
  { unique: true }
);

//index for scanning for latest workouts, etc
workoutLogSchema.index({ userId: 1, trainingPlanId: 1, performed: -1 });

const WorkoutLog: Model<IWorkoutLog> = mongoose.model<IWorkoutLog>(
  "Workout",
  workoutLogSchema
);

export default WorkoutLog;
