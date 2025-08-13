export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface Exercise {
  _id: string
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TrainingPlanDTO{
  _id: string;
  name: string;
  createdAt?: string;
  days: Array<{
    _id: string;
    dayOfWeek: DayOfWeek;
    splitType: string;
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      repetitions: number;
      weight: number;
      unit: 'kg'|'lbs';
    }>
  }>;
  updatedAt?: string;
}

export interface TrainingPlanUI {
  _id: string;
  name: string;
  updatedAt: Date;
  days: TrainingPlanDTO['days']; // same shape in UI for now
}

export const toUIPlan = (p : TrainingPlanDTO) : TrainingPlanUI =>({
  _id: p._id,
  name: p.name,
  updatedAt: p.updatedAt? new Date(p.updatedAt) : new Date(),
  days: p.days,
})

export interface CreateTrainingPlanRequest {
  name: string;
  days: WorkoutDay[];
}
