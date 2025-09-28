import { AuthenticatedRequest } from "../middleware/auth";
import { IBodybuildingPlan } from "../models/BodybuildingPlan";
import { ICrossfitPlan } from "../models/CrossfitPlan";
import { Response, NextFunction } from "express";
import { findActiveTrainingPlanAssignment } from "../services/trainingPlanAssignment.service";
import {
  calculateStreak,
  findSkippedSplit,
  getLastWorkoutSplitType,
  getNextGoal,
  getWeeklyStats,
} from "../services/stats.services";
import {
  fetchCompletedWorkoutThisYear,
  fetchUpcomingWorkoutDay,
  fetchUserWorkoutLogs,
  getPRs,
  getTotalVolumeCurrentWeek,
  getTotalVolumeLastWeek,
  getWeeklyVolumeChange,
} from "../services/workoutLog.service";
import { fetchTotalPlans } from "../services/trainingPlan.service";

export const getStatsOveriew = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    const assignment = await findActiveTrainingPlanAssignment(
      userId,
      new Date().toISOString()
    );

    if (!assignment) {
      res.json({
        workoutsThisWeek: 0,
        totalVolume: 0,
        lastWorkout: null,
        workoutStreak: 0,
        nextGoalMessage: "No active training plan",
      });
      return;
    }

    const statsResult = await getWeeklyStats(
      userId,
      assignment.trainingPlan._id
    );

    const trainingPlan = assignment.trainingPlan as unknown as
      | IBodybuildingPlan
      | ICrossfitPlan;

    const { message, remainingDays, plannedDays } = getNextGoal(
      statsResult.workoutsThisWeek,
      trainingPlan
    );

    const lastSplitType = getLastWorkoutSplitType(
      statsResult.lastWorkoutDayId,
      trainingPlan
    );

    const logs = await fetchUserWorkoutLogs(userId, {
      fields: ["performed", "workoutDayId"],
    });

    console.log(logs);

    const skippedSplitType = findSkippedSplit(
      remainingDays,
      trainingPlan,
      logs
    );

    //workout streak (consecutive workouts up to today)
    let streak = calculateStreak(logs);

    res.json({
      workoutsThisWeek: statsResult.workoutsThisWeek,
      totalVolume: statsResult.totalVolume,
      lastWorkout: statsResult.lastWorkout,
      lastSplitType,
      workoutStreak: streak,
      nextGoalMessage: message,
      remainingDays: remainingDays,
      skippedSplitType,
      plannedWorkoutDaysForWeek: plannedDays,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getStatsProgress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.log(userId);
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    //find total volume for this week and last week
    const thisWeekVolume = await getTotalVolumeCurrentWeek(userId);
    const lastWeekVolume = await getTotalVolumeLastWeek(userId);

    let weeklyVolumeChange = getWeeklyVolumeChange(
      thisWeekVolume,
      lastWeekVolume
    );

    const prs = await getPRs(userId);
    const topLift = prs[0] || { _id: "None", maxWeight: 0 };

    res.json({
      topLift: { name: topLift._id, weight: topLift.maxWeight, unit: "kg" },
      weeklyVolumeChange,
      thisWeekVolume: thisWeekVolume,
      lastWeekVolume: lastWeekVolume,
      pr: prs
        .slice(0, 3)
        .map((p) => ({ name: p._id, weight: p.maxWeight, unit: "kg" })),
    });
    return;
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
    return;
  }
};

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

    const completedWorkouts = (await fetchCompletedWorkoutThisYear(userId))
      .length;

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

    //streak of consecutive workout days
    //heavies list this week
    //muscle group distribution
    //last workout summary

    res.status(200).json({
      totalPlans,
      completedWorkouts,
      upcomingWorkoutDay,
      currentPlan: assignment.trainigsplan.name,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
    return;
  }
};
