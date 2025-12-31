import { WorkoutDay } from "../types/trainingPlan";

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

  const hasAtLeastOneSplit = days.some(
    (day) => day.splitType && day.splitType.trim().length > 0
  );

  if (!hasAtLeastOneSplit) {
    return {
      valid: false,
      message: "Please add at least one training day with a split type.",
    };
  }

  const hasTrainingDay = days.some((d) => d.exercises.length > 0);
  if (!hasTrainingDay)
    return {
      valid: false,
      message: "Please add at least one training day with exercises.",
    };

  for (const day of days) {
    const isTrainingDay = day.exercises.length > 0;

    if (isTrainingDay && !day.splitType.trim()) {
      return {
        valid: false,
        message: `Split Type is required for ${day.dayOfWeek} because it has exercises.`,
      };
    }

    if (!isTrainingDay) continue;

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
            message: `Reps must be a positive number (Set ${i + 1}) on ${day.dayOfWeek
              } for ${ex.name}`,
          };

        if (set.weight === undefined || isNaN(set.weight) || set.weight < 0)
          return {
            valid: false,
            message: `Weight must be zero or positive (Set ${i + 1}) on ${day.dayOfWeek
              } for ${ex.name}`,
          };

        if (!set.unit || !["kg", "lbs"].includes(set.unit))
          return {
            valid: false,
            message: `Unit must be "kg" or "lbs" (Set ${i + 1}) on ${day.dayOfWeek
              } for ${ex.name}`,
          };
      }
    }
  }

  return { valid: true };
}
