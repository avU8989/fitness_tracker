import { Exercise } from "./trainingPlan";

export interface WorkoutLogDTO {
  _id: string;
}

export interface LoggedSet {
  rpe: undefined;
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
}

export interface LoggedExercise {
  exerciseId?: string;
  name: string;
  warmupSets?: LoggedSet[];
  sets: LoggedSet[];
  rpe?: number;
}
