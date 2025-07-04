import { WorkoutDay } from "../requests/trainingPlan";

export function sanitizeTrainingPlanData(days: WorkoutDay[]) {
  return days.map((day) => ({
    ...day,
    splitType: day.splitType.trim(),
    exercises: day.exercises.map((ex) => ({
      name: ex.name.trim(),
      sets: Number(ex.sets) || 0,
      repetitions: Number(ex.repetitions) || 0,
      weight: Number(ex.weight) || 0,
      unit: ex.unit || "kg",
    })),
  }));
}

export function validateTrainingPlanData(
  name: string,
  days: WorkoutDay[]
): { valid: boolean; message?: string } {
  if (!name.trim())
    return { valid: false, message: "Please enter a plan name." };

  for (const day of days) {
    if (!day.splitType.trim())
      return {
        valid: false,
        message: `Split Type is required for ${day.dayOfWeek}`,
      };

    for (const ex of day.exercises) {
      if (!ex.name.trim())
        return {
          valid: false,
          message: `Exercise name is required on ${day.dayOfWeek}`,
        };
      if (!ex.sets || isNaN(ex.sets) || Number(ex.sets) <= 0)
        return {
          valid: false,
          message: `Sets must be positive on ${day.dayOfWeek} for ${ex.name}`,
        };
      if (
        !ex.repetitions ||
        isNaN(ex.repetitions) ||
        Number(ex.repetitions) <= 0
      )
        return {
          valid: false,
          message: `Repetitions must be positive on ${day.dayOfWeek} for ${ex.name}`,
        }; // singular key
      if (!ex.weight || isNaN(ex.weight) || Number(ex.weight) < 0)
        return {
          valid: false,
          message: `Weight must be zero or positive on ${day.dayOfWeek} for ${ex.name}`,
        };
    }
  }

  return { valid: true };
}
