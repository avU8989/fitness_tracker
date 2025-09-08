import { WorkoutDay } from "../types/trainingPlan";

export interface CreateTrainingPlanRequest {
  name: string;
  days: WorkoutDay[];
  type?: "Bodybuilding" | "Powerlifting" | "Crossfit";
}
