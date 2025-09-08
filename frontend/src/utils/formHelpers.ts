import { WorkoutDay } from "../requests/trainingPlan";

export function sanitizeTrainingPlanData(days: WorkoutDay[]) {
  return days.map((day) => ({
    ...day,
    splitType: day.splitType.trim(),
    exercises: day.exercises.map((ex) => ({
      name: ex.name.trim(),
      sets: ex.sets.map((s) => ({
        reps: Number(s.reps) || 0,
        weight: Number(s.weight) || 0,
        unit: s.unit || "kg",
      })),
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

      if (!ex.sets || !Array.isArray(ex.sets) || ex.sets.length === 0)
        return {
          valid: false,
          message: `At least one set is required on ${day.dayOfWeek} for ${ex.name}`,
        };

      for (let i = 0; i < ex.sets.length; i++) {
        const set = ex.sets[i];

        if (!set.reps || isNaN(set.reps) || set.reps <= 0)
          return {
            valid: false,
            message: `Reps must be a positive number (Set ${i + 1}) on ${
              day.dayOfWeek
            } for ${ex.name}`,
          };

        if (set.weight === undefined || isNaN(set.weight) || set.weight < 0)
          return {
            valid: false,
            message: `Weight must be zero or positive (Set ${i + 1}) on ${
              day.dayOfWeek
            } for ${ex.name}`,
          };

        if (!set.unit || !["kg", "lbs"].includes(set.unit))
          return {
            valid: false,
            message: `Unit must be "kg" or "lbs" (Set ${i + 1}) on ${
              day.dayOfWeek
            } for ${ex.name}`,
          };
      }
    }
  }

  return { valid: true };
}
