import { Schema, Types } from "mongoose";
import { ISet, setSchema } from "./Set";

export interface IPlanExercise {
    exercise: Types.ObjectId;
    sets: Types.DocumentArray<ISet>;
}

export const planExerciseSchema = new Schema<IPlanExercise>(
    {
        exercise: {
            type: Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
        },
        sets: [setSchema],
    },
    { _id: false }
);
