import mongoose from "mongoose";
import WorkoutLog from "../models/Workout";
import { normalizeDate } from "../utils/controllerUtils";
import { startOfWeek, endOfWeek } from "date-fns";
import { ITrainingPlan } from "../models/TrainingPlan";
import { ITrainingPlanAssignment } from "../models/PlanAssignment";
import { IBodybuildingPlan } from "../models/BodybuildingPlan";
import CrossfitPlan, { ICrossfitPlan } from "../models/CrossfitPlan";

export const getWeeklyStats = async (
  userId: string,
  trainingPlanId: string
) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  //workouts this week for user
  /*do an aggregation instead of running 3 queries for calculating totalVolume, 
      number of workouts done this week and finding out the last workout logged*/
  const stats = await WorkoutLog.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        trainingPlanId: new mongoose.Types.ObjectId(trainingPlanId),
      },
    },

    {
      $addFields: {
        performedDate: { $toDate: "$performed" },
      },
    },

    {
      $facet: {
        volume: [
          { $unwind: "$exercises" },
          { $unwind: "$exercises.sets" },
          {
            $group: {
              _id: null,
              totalVolume: {
                $sum: {
                  $multiply: ["$exercises.sets.weight", "$exercises.sets.reps"],
                },
              },
            },
          },
        ],
        workouts: [
          {
            $group: {
              _id: null,
              workoutsThisWeek: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ["$performedDate", weekStart] },
                        { $lte: ["$performedDate", weekEnd] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              lastWorkout: { $max: "$performedDate" },
              lastWorkoutDayId: { $first: "$workoutDayId" },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalVolume: {
          $ifNull: [{ $arrayElemAt: ["$volume.totalVolume", 0] }, 0],
        },
        workoutsThisWeek: {
          $ifNull: [{ $arrayElemAt: ["$workouts.workoutsThisWeek", 0] }, 0],
        },
        lastWorkout: { $arrayElemAt: ["$workouts.lastWorkout", 0] },
        lastWorkoutDayId: { $arrayElemAt: ["$workouts.lastWorkoutDayId", 0] },
      },
    },
  ]);

  return (
    stats[0] || {
      totalVolume: 0,
      workoutsThisWeek: 0,
      lastWorkoutDayId: null,
      lastWorkout: null,
    }
  );
};

export const calculateStreak = (logs: any[]) => {
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const log of logs) {
    const logDate = new Date(log.performed);
    logDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = logDate;
    } else {
      break;
    }
  }
  return streak;
};

//get the remaining workout days for the user to finish this week
//if 0 remaining workout days - congratulate user with message
export const getNextGoal = (
  workoutsThisWeek: number,
  trainingPlan: ITrainingPlan & (IBodybuildingPlan | ICrossfitPlan)
): { message: string; remainingDays: number; plannedDays: number } => {
  //planned sessions this week
  const plannedDays = trainingPlan.days.filter(
    (day) => day.exercises.length > 0
  ).length;

  const remainingDays = Math.max(plannedDays - workoutsThisWeek, 0);

  let nextGoal;
  if (remainingDays > 0) {
    nextGoal = `Complete ${remainingDays} more workout${remainingDays > 1 ? "s" : ""} to finish this week!`;
  } else {
    nextGoal = "All workouts done this week - recovery time!";
  }

  return {
    message: nextGoal,
    remainingDays: remainingDays,
    plannedDays: plannedDays,
  };
};

export const findSkippedSplit = (
  remainingDays: number,
  trainingPlan: ITrainingPlan & (IBodybuildingPlan | ICrossfitPlan),
  logs: any[]
) => {
  const completedDayIds = logs
    .map((l) => l.workoutDayId?.toString())
    .filter(Boolean);

  // Find the first training day in the plan that is not in completedDayIds
  let skippedSplitType: string | null = null;
  if (remainingDays > 0) {
    const uncompletedDay = trainingPlan.days.find((day) => {
      return (
        day.exercises.length > 0 &&
        !completedDayIds.includes(
          (day._id as mongoose.Types.ObjectId)?.toString()
        )
      );
    });
    skippedSplitType = uncompletedDay?.splitType || null;
  }

  return skippedSplitType;
};

//returns the name of the split ("PULL, PUSH, LEGS, etc")
export const getLastWorkoutSplitType = (
  lastWorkoutDayId: string,
  trainingPlan: ITrainingPlan & (IBodybuildingPlan | ICrossfitPlan)
) => {
  let lastSplitType = null;

  if (lastWorkoutDayId && trainingPlan) {
    const lastWorkoutDay = trainingPlan.days.find(
      (d) =>
        (d._id as mongoose.Types.ObjectId).toString() ===
        lastWorkoutDayId.toString()
    );

    lastSplitType = lastWorkoutDay?.splitType || null;
  }

  return lastSplitType;
};
