import { Schema } from "mongoose";

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