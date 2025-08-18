import { Schema } from "mongoose";
import TrainingPlan, { ITrainingPlan, IWorkoutDay, workoutDaySchema } from "./TrainingPlan";

export interface ICrossfitPlan extends ITrainingPlan {
  days: IWorkoutDay[];
}

const crossfitSchema = new Schema<ICrossfitPlan>({
  days: { type: [workoutDaySchema], required: true }
});

const CrossfitPlan = TrainingPlan.discriminator<ICrossfitPlan>(
  "Crossfit",
  crossfitSchema
);

export default CrossfitPlan;
