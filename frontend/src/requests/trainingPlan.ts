export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface Exercise {
  _id: string;
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

export type PlanType = "Bodybuilding" | "Crossfit" | "Powerlifting";

type PowerliftingPhase = "Volume" | "Intensity" | "Peaking";

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

//Union of server responses
export type TrainingPlanDTO = BasePlanDTO | PowerliftingPlanDTO;

export interface TrainingPlanUI {
  _id: string;
  name: string;
  updatedAt: Date;
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

//type narrowing because plan can be base plan or powerliftint plan#, thought i could do it with simple if else
//yes im a noob at typescript
function isPowerlifting(plan: TrainingPlanDTO): plan is PowerliftingPlanDTO {
  return plan.type === "Powerlifting";
}

export function toUIPlan(
  plan: TrainingPlanDTO,
  opts?: { activeWeekNumber?: number }
): TrainingPlanUI {
  const updatedAt = plan.updatedAt ? new Date(plan.updatedAt) : new Date();

  if (isPowerlifting(plan)) {
    const weeks = plan.weeks ?? [];
    const weeksCount = weeks.length;
    const targetWeek =
      weeks.find((w) => w.weekNumber === opts?.activeWeekNumber) ?? weeks[0];

    return {
      _id: plan._id,
      name: plan.name,
      updatedAt,
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
    updatedAt,
    type: plan.type,
    days: plan.days,
  };
}

export interface CreateTrainingPlanRequest {
  name: string;
  days: WorkoutDay[];
  type?: "Bodybuilding" | "Powerlifting" | "Crossfit";
}
