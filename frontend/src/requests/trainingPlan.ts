export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface ExerciseSet {
  reps: number;
  weight: number;
  unit: "kg" | "lbs";
}

export interface Exercise {
  _id: string;
  name: string;
  sets: ExerciseSet[]; // ⬅️ Now an array of sets
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

// Type narrowing
function isPowerlifting(plan: TrainingPlanDTO): plan is PowerliftingPlanDTO {
  return plan.type === "Powerlifting";
}

export function toUIPlan(
  plan: TrainingPlanDTO,
  opts?: { activeWeekNumber?: number }
): TrainingPlanUI {
  if (isPowerlifting(plan)) {
    const weeks = plan.weeks ?? [];
    const weeksCount = weeks.length;
    const targetWeek =
      weeks.find((w) => w.weekNumber === opts?.activeWeekNumber) ?? weeks[0];

    return {
      _id: plan._id,
      name: plan.name,
      type: plan.type,
      days: targetWeek?.days ?? [],
      meta: {
        powerlifting: {
          weeksCount,
          activeWeekNumber: targetWeek?.weekNumber ?? 1,
          phase: plan.intensityPhase,
          notes: plan.weeklyFocusNotes,
        },
      },
    };
  }

  return {
    _id: plan._id,
    name: plan.name,
    type: plan.type,
    days: plan.days,
  };
}

export interface CreateTrainingPlanRequest {
  name: string;
  days: WorkoutDay[];
  type?: "Bodybuilding" | "Powerlifting" | "Crossfit";
}

export interface CreateTrainingAssignmentRequest {
  trainingPlanId: string;
  startDate: string;
  endDate?: string | null;
}
