import WorkoutLog from "../models/Workout";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

// POST /workouts - Log a new workout
export const createWorkoutLog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date, exercises, duration, caloriesBurned, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const createdWorkout = new WorkoutLog({
      userId,
      date,
      exercises, // array of { exerciseId?, name, sets, reps, weight, unit, rpe? }
      duration,
      caloriesBurned,
      notes,
    });

    const savedWorkout = await createdWorkout.save();

    res
      .status(201)
      .json({ message: "Workout logged successfully", workout: savedWorkout });
  } catch (error: any) {
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
