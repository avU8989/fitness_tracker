import { startOfWeek, endOfWeek } from "date-fns";
import { AuthenticatedRequest } from "../middleware/auth";
import WorkoutLog from "../models/Workout";
import TrainingPlanAssignment, {
  ITrainingPlanAssignment,
} from "../models/PlanAssignment";
import mongoose, { HydratedDocument } from "mongoose";
import { ITrainingPlan, TrainingPlanType } from "../models/TrainingPlan";
import { IBodybuildingPlan } from "../models/BodybuildingPlan";
import { ICrossfitPlan } from "../models/CrossfitPlan";
import { Response, NextFunction } from "express";
import trainingAssignmentRouter from "../routes/trainingAssignmentRoutes";
import { normalizeDate } from "../utils/controllerUtils";

export const getStatsOveriew = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userid = req.user?.id;
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    console.log(weekStart);
    console.log(weekEnd);

    // normalize to start and end of day (UTC)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    const assignment = await TrainingPlanAssignment.findOne({
      user: userid,
      startDate: { $lte: endOfDay },
      $or: [
        { endDate: null },
        { endDate: { $exists: false } },
        { endDate: { $gte: startOfDay } },
      ],
    }).populate<{ trainingPlan: HydratedDocument<ITrainingPlan> }>(
      "trainingPlan"
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

    if (!userid) {
      console.log(userid);
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }
    //workouts this week for user
    /*do an aggregation instead of running 3 queries for calculating totalVolume, 
    number of workouts done this week and finding out the last workout logged*/
    const stats = await WorkoutLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userid),
          trainingPlanId: assignment.trainingPlan._id,
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
                    $multiply: [
                      "$exercises.sets.weight",
                      "$exercises.sets.reps",
                    ],
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

    const result = stats[0] || {
      totalVolume: 0,
      workoutsThisWeek: 0,
      lastWorkoutDayId: null,
      lastWorkout: null,
    };

    //get the remaining workout days for the user to finish this week
    //if 0 remaining workout days - congratulate user with message
    const { message, remainingDays } = getNextGoal(
      result.workoutsThisWeek,
      assignment.toObject() as unknown as ITrainingPlanAssignment & {
        trainingPlan: ITrainingPlan;
      }
    );

    const trainingPlan = assignment.trainingPlan as unknown as
      | IBodybuildingPlan
      | ICrossfitPlan;

    let lastSplitType;

    //last workout splittype
    if (result.lastWorkoutDayId && trainingPlan) {
      const lastWorkoutDay = trainingPlan.days.find(
        (d) =>
          (d._id as mongoose.Types.ObjectId).toString() ===
          result.lastWorkoutDayId.toString()
      );

      lastSplitType = lastWorkoutDay?.splitType || null;
    }

    //workout streak (consecutive workouts up to today)
    const logs = await WorkoutLog.find({
      userId: userid,
    })
      .sort({
        performed: -1,
      })
      .select("performed");

    console.log(logs);

    let streak = 0;
    let currentDate = normalizeDate(new Date());
    for (const log of logs) {
      const logDate = normalizeDate(new Date(log.performed));
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
    res.json({
      workoutsThisWeek: result.workoutsThisWeek,
      totalVolume: result.totalVolume,
      lastWorkout: result.lastWorkout,
      lastSplitType,
      workoutStreak: streak,
      nextGoalMessage: message,
      remainingDays: remainingDays,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats overview" });
  }
};

const getNextGoal = (
  workoutsThisWeek: number,
  assignment: ITrainingPlanAssignment & { trainingPlan: ITrainingPlan }
): { message: string; remainingDays: number } => {
  //narrow to only bodybuilding and crossfit
  //TO-DO powerlifting comes later
  const trainingPlan = assignment.trainingPlan as unknown as
    | IBodybuildingPlan
    | ICrossfitPlan;

  //planned sessions this week
  const plannedDays = trainingPlan.days.filter(
    (day) => day.exercises.length > 0
  ).length;

  console.log(plannedDays);

  const remainingDays = Math.max(plannedDays - workoutsThisWeek, 0);

  let nextGoal;
  if (remainingDays > 0) {
    nextGoal = `Complete ${remainingDays} more workout${remainingDays > 1 ? "s" : ""} to finish this week!`;
  } else {
    nextGoal = "All workouts done this week - recovery time!";
  }

  return { message: nextGoal, remainingDays: remainingDays };
};
