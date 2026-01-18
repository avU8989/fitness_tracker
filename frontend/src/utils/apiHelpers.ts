import { PlannedExercise } from "../screens/tabs/LogScreen";
import {
  DayOfWeek,
  Exercise,
  PlannedExerciseUI,
  PowerliftingPlanDTO,
  TrainingPlanDTO,
  TrainingPlanUI,
} from "../types/trainingPlan";

export async function handleResponse(
  response: Response,
  defaultMessage: string
) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(response.statusText || defaultMessage);
    }

    if (errorData.errors && Array.isArray(errorData.errors)) {
      const error = new Error(errorData.message || defaultMessage);
      (error as any).errors = errorData.errors;
      throw error;
    }
    throw new Error(errorData.message || defaultMessage);
  }

  return response.json();
}

export function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function toDateFormatFetchActiveTrainingPlans(date: Date): string {
  return date.toLocaleDateString("en-CA");
}

export function getTodayName(): DayOfWeek {
  const map: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const todayIndex = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  return map[todayIndex];
}

// Type narrowing
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
      days: mapDaysToUI(targetWeek.days),
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
    days: mapDaysToUI(plan.days),
  };
}

function mapDaysToUI(days: any[]) {
  return days.map((day) => ({
    ...day,
    exercises: day.exercises.map((ex: any) => ({
      name: ex.exercise?.name ?? "UNKNOWN EXERCISE",
      sets: ex.sets,
    })),
  }));
}

type RawPlanExercise = {
  exercise: {
    name: string;
  };
  sets: {
    reps: number;
    weight: number;
    unit: "kg" | "lbs";
  }[];
};


export function normalizeExercises(
  rawExercises: RawPlanExercise[]
): Exercise[] {
  return rawExercises.map((ex) => ({
    name: ex.exercise.name,
    sets: ex.sets.map((s) => ({
      reps: s.reps,
      weight: s.weight,
      unit: s.unit,
    })),
  }));
}

