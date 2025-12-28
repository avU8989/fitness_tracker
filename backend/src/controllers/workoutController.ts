import WorkoutLog from "../models/Workout";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { CreateWorkoutLogRequest } from "../requests/workouts/CreateWorkoutLogRequest";
import {
  getTrainingPlanById,
  getWorkoutDayFromPlan,
} from "../services/trainingPlan.service";
import {
  createWorkoutLog,
  fetchNextSkippedDay,
  fetchUpcomingWorkoutDay,
  fetchUserWorkoutLogs,
  fetchWeeklyWorkoutLogs,
  removeWorkoutLog,
} from "../services/workoutLog.service";
import { findActiveTrainingPlanAssignment } from "../services/trainingPlanAssignment.service";

// POST /workouts - Log a new workout
export const postWorkoutLog = async (
  req: AuthenticatedRequest & { body: CreateWorkoutLogRequest },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { trainingPlanId, workoutDayId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    if (!trainingPlanId) {
      res.status(400).json({ message: "Training plan ID is required" });
      return;
    }

    //fetch trainingplan
    const trainingPlan = await getTrainingPlanById(trainingPlanId);
    if (!trainingPlan) {
      res.status(404).json({ message: "Trainingplan not found" });
      return;
    }

    const workoutDay = await getWorkoutDayFromPlan(trainingPlan, workoutDayId);

    if (!workoutDay) {
      res.status(404).json({ message: "Workout Day not found" });
      return;
    }

    const loggedWorkout = await createWorkoutLog(userId, req.body, workoutDay);

    res.status(201).json({
      message: "Workout logged successfully",
      workout: {
        id: loggedWorkout.id,
        dayOfWeek: loggedWorkout.dayOfWeek,
        planned: { exercises: loggedWorkout.plannedExercises },
        actual: { exercises: loggedWorkout.exercises },
      },
    });
  } catch (error: any) {
    console.error("Unexpected error creting workout log:", error);
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
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const workouts = await fetchUserWorkoutLogs(userId, {
      date: typeof req.query.date === "string" ? req.query.date : undefined,
    });

    res.status(200).json(workouts);
  } catch (error: any) {
    console.error("Unexpected error fetching workout log:", error);
    if (error.code === 11000) {
      res
        .status(400)
        .json({ error: "Workout log already exists for this day" });
      return;
    }

    res
      .status(500)
      .json({ message: "Failed to fetch workouts", error: error.message });
  }
};

export const getNextSkippedWorkoutDay = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const assignment = await findActiveTrainingPlanAssignment(
      userId,
      new Date().toISOString()
    );

    if (!assignment || !assignment.trainingPlan) {
      res.status(404).json({ message: "Could not find active plan" });
      return;
    }

    const nextSkippedDay = await fetchNextSkippedDay(
      userId,
      assignment.trainingPlan
    );

    if (!nextSkippedDay) {
      res.status(404).json({ message: "Could not find next skipped day" });
      return;
    }

    res.json({ nextSkippedDay: nextSkippedDay || null });
    return;
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
    return;
  }
};

export const getUpcomingWorkoutDay = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const assignment = await findActiveTrainingPlanAssignment(
      userId,
      new Date().toISOString()
    );

    if (!assignment || !assignment.trainingPlan) {
      res.status(404).json({ message: "Could not find active plan" });
      return;
    }

    const nextUpcomingWorkout = await fetchUpcomingWorkoutDay(
      userId,
      assignment.trainingPlan
    );

    if (!nextUpcomingWorkout) {
      res
        .status(404)
        .json({ message: "Could not find upcoming Workout in training plan" });
      return;
    }

    res.status(200).json({ nextUpcomingWorkout: nextUpcomingWorkout });
    return;
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
    return;
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
    await removeWorkoutLog(workoutId, userId);

    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res
      .status(status)
      .json({ message: err.message || "Internal server error" });
  }
};
