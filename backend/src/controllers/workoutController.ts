import Workout from "../models/Workout";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

// POST /workouts - Log a new workout
export const createWorkout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, duration, caloriesBurned, date } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const createdWorkout = new Workout({
      type,
      duration,
      caloriesBurned,
      date,
      userId,
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

// GET /workout - Retrieve workouts
export const getWorkouts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = (req as any).user?.id;

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
      //mongo db query --> find document where date is greater than or equal (gte) "start" and less than(lt) "end"
      query.date = { $gte: start, $lt: end };
    }

    const workouts = await Workout.find(query).sort({ date: -1 });
    res.status(200).json(workouts);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch workouts", error: error.message });
  }
};
