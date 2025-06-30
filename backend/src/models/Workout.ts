import mongoose, { Document, Types, Schema, Model } from "mongoose";

export interface IExerciseLog {
  exerciseId?: Types.ObjectId;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
  rpe?: number;
}

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  date: Date;
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
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
  unit: { type: String, enum: ["kg", "lbs"], required: true },
  rpe: { type: Number },
});

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
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
