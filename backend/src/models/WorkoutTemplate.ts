import mongoose, { Document, Types, Schema, Model } from "mongoose";
import { IPlanExercise, planExerciseSchema } from "./schemas/PlanExercise";


export interface IWorkoutTemplate extends Document {
    user: Types.ObjectId;
    name: string;
    splitType: string;
    exercises: IPlanExercise[];
    createdAt?: Date;
    updatedAt?: Date;
}

const workoutTemplateSchema = new Schema<IWorkoutTemplate>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    splitType: { type: String, required: true, trim: true },
    exercises: { type: [planExerciseSchema], default: [] }
},
    { timestamps: true }
);

workoutTemplateSchema.index({ user: 1, name: 1 }, { unique: true });

const WorkoutTemplate: Model<IWorkoutTemplate> = mongoose.model<IWorkoutTemplate>(
    "WorkoutTemplate",
    workoutTemplateSchema,
    "workout_templates"
)

export default WorkoutTemplate;