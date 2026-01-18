import mongoose, { Document, Model, Types, Schema } from "mongoose";
import { Muscle, MUSCLES } from "./constants/muscles";
import { MOVEMENT_PATTERNS, MovementPattern } from "./constants/movementPattern";

export interface ISet extends Document {
    reps: number;
    weight: number;
    unit: "kg" | "lbs";
}

export const setSchema = new Schema<ISet>(
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
    primaryMuscles: Muscle[];
    secondaryMuscles?: Muscle[];
    movementPattern: MovementPattern;
    description: string;
    equipment: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const exerciseSchema = new Schema<IExercise>(
    {
        name: { type: String, required: true, trim: true },
        primaryMuscles: { type: [String], enum: MUSCLES, required: true },
        secondaryMuscles: { type: [String], enum: MUSCLES, },
        movementPattern: { type: String, enum: MOVEMENT_PATTERNS, required: true },
        description: { type: String, required: true, trim: true },
        equipment: { type: String, required: true, trime: true },
        imageUrl: { type: String },
        videoUrl: { type: String },
    },
    { timestamps: true }
);

exerciseSchema.index({ primaryMuscles: 1 });
exerciseSchema.index({ secondaryMuscles: 1 });

const Exercise: Model<IExercise> = mongoose.model<IExercise>(
    "Exercise", exerciseSchema, "exercises"
)

export default Exercise;