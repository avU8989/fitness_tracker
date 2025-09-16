export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface ExerciseSet {
  _id?: string;
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
}

export interface Exercise {
  _id?: string;
  name: string;
  sets: ExerciseSet[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutDay {
  _id: string;
  dayOfWeek: DayOfWeek;
  splitType: string;
  exercises: Exercise[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type PlanType = "Bodybuilding" | "Crossfit" | "Powerlifting";

export type PowerliftingPhase = "Volume" | "Intensity" | "Peaking";

export interface BasePlanDTO {
  _id: string;
  type: Exclude<PlanType, "Powerlifting">;
  name: string;
  days: WorkoutDay[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PowerWeekDTO {
  _id?: string;
  weekNumber: number;
  days: WorkoutDay[];
}

export interface PowerliftingPlanDTO {
  _id: string;
  type: "Powerlifting";
  name: string;
  blockPeriodization: boolean;
  blockStartDate: Date;
  weeks: PowerWeekDTO[];
  weeklyFocusNotes?: string[];
  accessoryFocus?: string[];
  competitionPrep?: boolean;
  intensityPhase?: PowerliftingPhase;
  createdAt?: string;
  updatedAt?: string;
}

export type TrainingPlanDTO = BasePlanDTO | PowerliftingPlanDTO;

export interface TrainingPlanAssignment {
  _id: string;
  user: string;
  startDate: string;
  endDate: string;
  trainingPlan: TrainingPlanDTO;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPlanUI {
  updatedAt: Date;
  _id: string;
  name: string;
  type: PlanType;
  days: WorkoutDay[];
  meta?: {
    powerlifting?: {
      weeksCount: number;
      activeWeekNumber: number;
      phase?: PowerliftingPhase;
      notes?: string[];
    };
  };
}
