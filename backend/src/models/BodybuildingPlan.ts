import { Schema, Types } from "mongoose";
import TrainingPlan, {
  ITrainingPlan,
  IWorkoutDay,
  workoutDaySchema,
} from "./TrainingPlan";

export interface IBodybuildingPlan extends ITrainingPlan {
  days: Types.DocumentArray<IWorkoutDay>;
}

const bodybuildingSchema = new Schema<IBodybuildingPlan>({
  days: { type: [workoutDaySchema], required: true },
});

const BodybuildingPlan = TrainingPlan.discriminator<IBodybuildingPlan>(
  "Bodybuilding",
  bodybuildingSchema
);

export default BodybuildingPlan;
