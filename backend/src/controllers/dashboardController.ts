import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { IBodybuildingPlan } from "../models/BodybuildingPlan";
import { ICrossfitPlan } from "../models/CrossfitPlan";
import { fetchTotalPlans } from "../services/trainingPlan.service";
import {
  findActiveTrainingPlanAssignment,
  findUpcomingTrainingPlanAssignment,
} from "../services/trainingPlanAssignment.service";
import {
  fetchCompletedWorkoutThisYear,
  fetchUpcomingWorkoutDay,
} from "../services/workoutLog.service";

export const getDashboardOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //fetch number of total plans
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }
    const totalPlans = await fetchTotalPlans(userId);
    //fetch number of completed workouts

    const completedWorkouts = await fetchCompletedWorkoutThisYear(userId);

    const assignment = await findActiveTrainingPlanAssignment(
      userId,
      new Date().toISOString()
    );

    if (!assignment) {
      res
        .status(404)
        .json({ message: "Could not find active Training Plan Assignment" });
      return;
    }

    const trainingPlan = assignment.trainingPlan as unknown as
      | IBodybuildingPlan
      | ICrossfitPlan;

    //fetch upcoming workout
    const upcomingWorkoutDay = await fetchUpcomingWorkoutDay(
      userId,
      trainingPlan
    );

    const upcomingTrainingAssignment =
      await findUpcomingTrainingPlanAssignment(userId);

    //streak of consecutive workout days
    //heavies list this week
    //muscle group distribution
    //last workout summary

    res.status(200).json({
      totalPlans,
      completedWorkouts,
      upcomingWorkoutDay,
      currentPlan: assignment.trainingPlan.name,
      nextPlan: upcomingTrainingAssignment?.trainingPlan.name ?? null,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
    return;
  }
};
