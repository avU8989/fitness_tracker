import { Schema, Types } from "mongoose";
import TrainingPlan, {
  ITrainingPlan,
  IWorkoutDay,
  workoutDaySchema,
} from "./TrainingPlan";

export interface IPowerliftingPlan extends ITrainingPlan {
  blockPeriodization: boolean;
  blockStartDate: Date;
  weeks: [
    {
      weekNumber: Number;
      days: Types.DocumentArray<IWorkoutDay>;
    },
  ];
  weeklyFocusNotes?: string[];
  accessoryFocus?: string[];
  competitionPrep?: boolean;
  intensityPhase?: "Volume" | "Intensity" | "Peaking";
}

const weekSchema = new Schema({
  weekNumber: { type: Number, required: true },
  days: [workoutDaySchema],
});

const powerLiftingSchema = new Schema<IPowerliftingPlan>({
  blockPeriodization: { type: Boolean, required: true },
  blockStartDate: { type: Date, required: true },
  weeks: { type: [weekSchema], required: true },
  weeklyFocusNotes: { type: [String], default: [] },
  accessoryFocus: { type: [String], default: [] },
  competitionPrep: { type: Boolean },
  intensityPhase: {
    type: String,
    required: true,
    enum: ["Volume", "Intensity", "Peaking"],
  },
});

const PowerLiftingPlan = TrainingPlan.discriminator<IPowerliftingPlan>(
  "Powerlifting",
  powerLiftingSchema
);

export default PowerLiftingPlan;
