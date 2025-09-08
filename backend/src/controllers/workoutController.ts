import WorkoutLog from "../models/Workout";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import TrainingPlan from "../models/TrainingPlan";
import { IBodybuildingPlan } from "../models/BodybuildingPlan";
import { ICrossfitPlan } from "../models/CrossfitPlan";
import { IPowerliftingPlan } from "../models/PowerliftingPlan";
import { formatLocalDateYYYYMMDD } from "../utils/controllerUtils";
// POST /workouts - Log a new workout
export const createWorkoutLog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      trainingPlanId,
      workoutDayId,
      performed,
      exercises,
      duration,
      caloriesBurned,
      notes,
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }
    let workoutDay;
    //fetch trainingplan
    const trainingPlan = await TrainingPlan.findById(trainingPlanId);
    if (!trainingPlan) {
      res.status(404).json({ message: "Trainingplan not found" });
      return;
    }

    if (
      trainingPlan.type === "Bodybuilding" ||
      trainingPlan.type === "Crossfit"
    ) {
      //cast to unknown because of not exisitng days in ITrainingPlan
      const plan = trainingPlan as unknown as IBodybuildingPlan | ICrossfitPlan;
      //IBodyBuildingPlan and ICrossfitPlan has days
      //need to have days as DocumentArray to fetch the id, so TS knows id exists from mongo
      workoutDay = plan.days.id(workoutDayId);
    } else if (trainingPlan.type === "Powerlifting") {
      const powerliftingPlan = trainingPlan as unknown as IPowerliftingPlan;
      for (const week of powerliftingPlan.weeks) {
        const found = week.days.id(workoutDayId);

        if (found) {
          workoutDay = found;
          break;
        }
      }
    }

    if (!workoutDay) {
      res.status(404).json({ message: "Workout Day not found" });
      return;
    }

    //normalize date to store and ensure uniqueness upon performed index in mongo
    const normalizedDate = performed
      ? formatLocalDateYYYYMMDD(performed)
      : formatLocalDateYYYYMMDD(new Date());

    const loggedWorkout = new WorkoutLog({
      userId,
      trainingPlanId,
      workoutDayId,

      //snapshot
      dayOfWeek: workoutDay.dayOfWeek,
      plannedExercises: workoutDay.exercises,

      //actual log of workout
      performed: normalizedDate,
      exercises,
      duration,
      caloriesBurned,
      notes,
    });

    const savedWorkout = await loggedWorkout.save();

    res.status(201).json({
      message: "Workout logged successfully",
      workout: {
        id: savedWorkout.id,
        dayOfWeek: savedWorkout.dayOfWeek,
        planned: { exercises: savedWorkout.plannedExercises },
        actual: { exercises: savedWorkout.exercises },
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        error: "Workout log already exists for this day",
      });
      return;
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// GET /workouts - Retrieve workouts (optionally filter by date)
export const getWorkoutLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID missing" });
    return;
  }

  try {
    const { date } = req.query;
    const query: any = { userId };

    if (date && typeof date === "string") {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    const workouts = await WorkoutLog.find(query).sort({ date: -1 });
    res.status(200).json(workouts);
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      res
        .status(400)
        .json({ error: "Workout log already exists for this day" });
      return;
    }

    console.error("Unexpected error creating workout log:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch workouts", error: error.message });
  }
};

// DELETE /workouts/:workoutId - Delete a workout log
export const deleteWorkoutLog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  const { workoutId } = req.params;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID missing" });
    return;
  }

  try {
    const workout = await WorkoutLog.findOne({ _id: workoutId, userId });

    if (!workout) {
      res
        .status(404)
        .json({ message: "Unable to find workout or unauthorized" });
      return;
    }

    await workout.deleteOne();

    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
