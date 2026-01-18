import mongoose, { HydratedDocument } from "mongoose";
import TrainingPlan from "../models/TrainingPlan";
import PowerLiftingPlan from "../models/PowerliftingPlan";
import TrainingPlanAssignment from "../models/PlanAssignment";
import Exercise from "../models/Exercise";

//Hydrated Document has getters, setters, change tracking,
type PlanDoc = HydratedDocument<any>;

export async function loadUserPlan(
  userId: string,
  planId: string
): Promise<PlanDoc | null> {
  return TrainingPlan.findOne({ _id: planId, user: userId });
}

//find a day by id for any plan type
//for powerlifting pass optionally weekId or weekNumber in parameters

export function findWorkoutDay(
  plan: any,
  opts: { dayId?: string; weekId?: string; weekNumber?: number }
): {
  day: any | null;
  container: "days" | "weeks.days";
  weekIdx?: number;
} {
  if (plan.type.toLowerCase() === "powerlifting") {
    if (opts.weekId) {
      //simple check for week Id in TrainingPlan weeks field
      const wIdx = plan.weeks?.findIndex(
        (w: any) => String(w._id) === String(opts.weekId)
      );

      if (wIdx != null && wIdx > 0) {
        const day = plan.weeks[wIdx].days.id(opts.dayId);
        return { day, container: "weeks.days", weekIdx: wIdx };
      }
    }

    //simple check for week Number in Trainingplan weeks field
    if (opts.weekNumber != null) {
      const wIdx = plan.weeks?.findIndex(
        (w: any) => w.weekNumber == opts.weekNumber
      );
      if (wIdx != null && wIdx > 0) {
        const day = plan.weeks[wIdx].days.id(opts.dayId);
        return { day, container: "weeks.days", weekIdx: wIdx };
      }
    }

    //scan all weeks
    if (plan.weeks) {
      for (let i = 0; i < plan.weeks.length; i++) {
        const found = plan.weeks[i].days.id(opts.dayId);

        if (found) {
          return { day: found, container: "weeks.days", weekIdx: i };
        }
      }
    }
    return { day: null, container: "weeks.days" };
  }
  // Bodybuilding/Crossfit
  const day = plan.days?.id(opts.dayId);
  return { day, container: "days" };
}

export async function mapDaysWithExercises(days: any[]) {
  return Promise.all(
    days.map(async (day) => ({
      dayOfWeek: day.dayOfWeek,
      splitType: day.splitType,
      exercises: await Promise.all(
        //validate for Exercise ID
        day.exercises.map(async (ex: any) => {
          const exercise = await Exercise.findById(ex.exerciseId).select("_id name");

          if (!exercise) {
            throw new Error("Invalid Exercise ID");
          }

          return {
            exercise: exercise._id,
            sets: ex.sets,
          }
        })
      )
    }))
  )
}