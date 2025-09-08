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
  plannedExercises?: IExercise[]; // snapshot of planned exercises
  performed: Date;
  exercises: IExerciseLog[];
  duration?: number;
  caloriesBurned?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExerciseLogSchema = new Schema<IExerciseLog>({
  exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
  name: { type: String, required: true },
  sets: { type: [setSchema], required: true },
  rpe: { type: Number },
});

const WorkoutLogSchema = new Schema<IWorkoutLog>(
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
    plannedExercises: [exerciseSchema],
    performed: { type: Date, default: Date.now },
    exercises: [ExerciseLogSchema],
    duration: Number,
    caloriesBurned: Number,
    notes: String,
  },
  { timestamps: true }
);

const WorkoutLog: Model<IWorkoutLog> = mongoose.model<IWorkoutLog>(
  "Workout",
  WorkoutLogSchema
);

export default WorkoutLog;
