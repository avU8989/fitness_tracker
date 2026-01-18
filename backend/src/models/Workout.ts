import mongoose, { Document, Types, Schema, Model } from "mongoose";
import { IExercise, ISet, setSchema } from "./Exercise";

export interface IExerciseLog {
  exerciseId?: Types.ObjectId;
  name: string;
  sets: ISet[];
  warmupSets?: ISet[];
  rpe?: number;
}

//snapshot for WorkoutLog
export interface IPlannedExerciseSnapshot {
  exerciseId?: Types.ObjectId;
  name?: string;
  sets: ISet[];
}

//for snapshots
const plannedExerciseSnapshotSchema =
  new Schema<IPlannedExerciseSnapshot>(
    {
      exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      name: { type: String },
      sets: { type: [setSchema], required: true },
    },
    { _id: false } // snapshots do NOT need ids
  );

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  trainingPlanId?: Types.ObjectId;
  workoutDayId?: Types.ObjectId;
  // Snapshots (at time of logging)
  dayOfWeek?: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  splitType?: string;
  plannedExercises?: IPlannedExerciseSnapshot[]; // snapshot of planned exercises
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
  warmupSets: { type: [setSchema], default: [] },
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
    plannedExercises: [plannedExerciseSnapshotSchema],
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
