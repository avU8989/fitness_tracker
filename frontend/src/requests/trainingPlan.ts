export interface Exercise {
  name: string;
  sets: number | string;
  repetitions: number | string;
  weight: number | string;
  unit: "kg" | "lbs";
}

export interface WorkoutDay {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  splitType: string;
  exercises: Exercise[];
}

export interface CreateTrainingPlanRequest {
  name: string;
  days: WorkoutDay[];
}
