import mongoose, { FilterQuery, HydratedDocument, Types } from "mongoose";
import WorkoutLog, { IWorkoutLog } from "../models/Workout";
import {
  endOfWeek,
  endOfYear,
  startOfWeek,
  startOfYear,
  subWeeks,
} from "date-fns";
import { CreateWorkoutLogRequest } from "../requests/workouts/CreateWorkoutLogRequest";
import { ITrainingPlan, IWorkoutDay } from "../models/TrainingPlan";
import { IBodybuildingPlan } from "../models/BodybuildingPlan";
import { ICrossfitPlan } from "../models/CrossfitPlan";
import {
  formatLocalDateYYYYMMDD,
  normalizeDate,
} from "../utils/controllerUtils";
import { ITrainingPlanAssignment } from "../models/PlanAssignment";
import { findActiveTrainingPlanAssignment } from "./trainingPlanAssignment.service";

export const createWorkoutLog = async (
  userId: string,
  req: CreateWorkoutLogRequest,
  workoutDay: IWorkoutDay
): Promise<HydratedDocument<IWorkoutLog>> => {
  //normalize date to store and ensure uniqueness upon performed index in mongo
  const {
    trainingPlanId,
    workoutDayId,
    exercises,
    duration,
    caloriesBurned,
    notes,
  } = req;
  const normalizedDate = req.performed ? req.performed : new Date();

  const loggedWorkout = new WorkoutLog({
    userId,
    trainingPlanId,
    workoutDayId,

    //snapshot
    dayOfWeek: workoutDay.dayOfWeek,
    //to prevent changes later when trainingplan changes, workout logs should not magically reflect those changes
    //by ensuring immutability we prevent that --> TODO still need to test it
    plannedExercises: workoutDay.exercises.map((e) => e.toObject()),

    //actual log of workout
    performed: normalizedDate,
    exercises,
    duration,
    caloriesBurned,
    notes,
  });

  return await loggedWorkout.save();
};

export const removeWorkoutLog = async (workoutId: string, userId: string) => {
  const workout = await WorkoutLog.findOne({ _id: workoutId, userId });

  if (!workout) {
    const error = new Error("Workout not found");
    (error as any).statusCode = 404;
    throw error;
  }

  await workout.deleteOne();
};

//only works for bodybuilding and crossfit plan right now
export const fetchNextSkippedDay = async (
  userId: string,
  trainingPlan: ITrainingPlan & (IBodybuildingPlan | ICrossfitPlan)
): Promise<IWorkoutDay | null> => {
  const plannedDays: IWorkoutDay[] = trainingPlan.days.filter(
    (d) => d.exercises?.length > 0
  );

  //logged workoutDays this week
  const loggedDays = await fetchWeeklyWorkoutLogs(userId, trainingPlan.id);

  const loggedDayIds = loggedDays.map((d) => d.workoutDayId?.toString());
  console.log(loggedDayIds);

  const nextSkippedDay = plannedDays.find(
    (day: any) => !loggedDayIds.includes(day._id.toString())
  );

  return nextSkippedDay ?? null;
};

export const fetchCompletedWorkoutThisYear = async (userId: string) => {
  const start = startOfYear(new Date());
  const end = endOfYear(new Date());

  return WorkoutLog.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    performed: { $gte: start, $lte: end },
  });
};

export const fetchUpcomingWorkoutDay = async (
  userId: string,
  trainingPlan: ITrainingPlan & (IBodybuildingPlan | ICrossfitPlan)
) => {
  const today = new Date();
  const formattedDate = new Date().toISOString();
  //
  const plannedDays = trainingPlan.days.filter(
    (d: any) => d.exercises.length > 0
  );

  const logged = await fetchWeeklyWorkoutLogs(userId, trainingPlan.id);
  const loggedIds = logged.map((l) => l.workoutDayId?.toString());

  const nextDay = plannedDays.find((d) => !loggedIds.includes(d.id));

  return nextDay || null;
};

export const fetchWeeklyWorkoutLogs = async (
  userId: string,
  trainingPlanId: string
): Promise<IWorkoutLog[]> => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  return WorkoutLog.find({
    userId: new mongoose.Types.ObjectId(userId),
    trainingPlanId,
    performed: { $gte: weekStart, $lte: weekEnd },
  }).select("workoutDayId performed");
};

export const fetchLastWorkoutLog = async (
  userId: string,
  trainingPlanId: string
): Promise<{
  workoutDayId: Types.ObjectId | undefined;
  performed: Date;
} | null> => {
  return WorkoutLog.findOne(
    {
      userId: new mongoose.Types.ObjectId(userId),
      trainingPlanId,
    },
    { performed: 1, workoutDayId: 1 }
  )
    .sort({ performed: -1 })
    .lean<{ workoutDayId: Types.ObjectId; performed: Date }>()
    .exec();
};

//works for 2025-09-08 to fetch WorkoutDay
//supports limit and projection
export const fetchUserWorkoutLogs = async (
  userId: string,
  options?: { date?: string; limit?: number; fields?: string[] }
): Promise<HydratedDocument<IWorkoutLog>[]> => {
  const filter: FilterQuery<IWorkoutLog> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (options?.date) {
    const start = new Date(options.date);
    const end = new Date(options.date);
    end.setDate(end.getDate() + 1);
    filter.performed = { $gte: start, $lt: end };
  }

  let query = WorkoutLog.find(filter).sort({ performed: -1 });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.fields) {
    query.select(options.fields.join(" "));
  }

  const logs = await query.exec();

  return logs;
};

const getTotalVolumeForRange = async (
  userId: string,
  start: Date,
  end: Date
): Promise<number> => {
  const result = await WorkoutLog.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        performed: { $gte: start, $lte: end },
      },
    },
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
  ]).exec();

  return result[0]?.totalVolume ?? 0;
};

export const getTotalVolumeCurrentWeek = async (
  userId: string
): Promise<number> => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return getTotalVolumeForRange(userId, weekStart, new Date());
};

export const getTotalVolumeLastWeek = async (
  userId: string
): Promise<number> => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(weekStart, 1);
  const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
  return getTotalVolumeForRange(userId, lastWeekStart, lastWeekEnd);
};

export const getWeeklyVolumeChange = (
  thisWeekVolume: number,
  lastWeekVolume: number
): string => {
  if (lastWeekVolume <= 0) return "N/A";

  if (lastWeekVolume > 0) {
    return `${(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100).toFixed(1)}%`;
  } else {
    return "0 %";
  }
};

interface PRResult {
  _id: string; //exercise name
  maxWeight: number; //heaviest set
}

export const getPRs = async (userId: string): Promise<PRResult[]> => {
  const result = await WorkoutLog.aggregate<PRResult>([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $addFields: {
        performedDate: { $toDate: "$performed" },
      },
    },
    { $unwind: "$exercises" },
    { $unwind: "$exercises.sets" },
    {
      $group: {
        _id: "$exercises.name",
        maxWeight: { $max: "$exercises.sets.weight" },
      },
    },
    { $sort: { maxWeight: -1 } },
  ]).exec();

  return result;
};
