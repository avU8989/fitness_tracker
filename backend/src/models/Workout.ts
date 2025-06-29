import mongoose, { Document, Schema, Model } from "mongoose";

export interface IWorkout extends Document {
  type: string;
  duration?: number;
  caloriesBurned?: number;
  date: Date;
  userId: mongoose.Types.ObjectId;
}

const workoutSchema: Schema<IWorkout> = new Schema({
  type: {
    type: String,
    required: true,
  },
  duration: Number,
  caloriesBurned: Number,
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Workout: Model<IWorkout> = mongoose.model<IWorkout>(
  "Workout",
  workoutSchema
);
export default Workout;
