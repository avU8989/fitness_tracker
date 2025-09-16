import mongoose, { HydratedDocument } from "mongoose";
import WorkoutLog, { IWorkoutLog } from "../models/Workout";
import { endOfWeek, startOfWeek, subWeeks } from "date-fns";

export const findUserWorkoutLogs = async (
  userId: string,
  options?: { limit?: number; fields?: string[] }
): Promise<HydratedDocument<IWorkoutLog>[]> => {
  const query = WorkoutLog.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).sort({ performed: -1 });

  if (options?.limit) {
    query.limit(options.limit);
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
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $addFields: { performedDate: { $toDate: "$performed" } } },
    { $unwind: "$exercises" },
    { $unwind: "$exercises.sets" },
    { $match: { performedDate: { $gte: start, $lte: end } } },
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
