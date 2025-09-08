import { LoggedExercise } from "../types/workoutLog";

export interface CreateWorkoutLogRequest {
  trainingPlanId: string;
  workoutDayId: string;
  performed: Date;
  exercises: LoggedExercise[];
  duration?: number;
  caloriesBurned?: number;
  notes?: string;
}
