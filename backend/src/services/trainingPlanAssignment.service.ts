import TrainingPlanAssignment, {
  ITrainingPlanAssignment,
} from "../models/PlanAssignment";
import { ITrainingPlan } from "../models/TrainingPlan";
import mongoose, { HydratedDocument, Document } from "mongoose";
import { normalizeDayRange } from "../utils/controllerUtils";

export const findActiveTrainingPlan = async (
  userId: string,
  date: Date
): Promise<(HydratedDocument<ITrainingPlan> & any) | null> => {
  if (!userId) {
    throw new Error("UserId is required");
  }

  // normalize to start and end of day (UTC)
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const assignment = TrainingPlanAssignment.findOne({
    user: new mongoose.Types.ObjectId(userId),
    startDate: { $lte: endOfDay },
    $or: [
      { endDate: null },
      { endDate: { $exists: false } },
      { endDate: { $gte: startOfDay } },
    ],
  }).populate<{ trainingPlan: HydratedDocument<ITrainingPlan> }>(
    "trainingPlan"
  );

  console.log(assignment);

  return assignment;
};

//overlap prevention - user cannot have two trainingplans active at the same time
export const hasOverlappingTrainingPlan = async (
  userId: string,
  startDate: Date,
  endDate?: Date
): Promise<boolean> => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const infinity = new Date(8640000000000000);
  const overlap = await TrainingPlanAssignment.exists({
    user: userId,
    $or: [
      //a trainingplan that has open end is still active
      {
        endDate: { $exists: false },
        startDate: { $lte: end ?? infinity },
      },
      //an active trainingplan exists, which ends later than the newly assigned trainingplan
      { endDate: { $gte: start } },
    ],
    startDate: { $lte: end ?? infinity },
  });

  if (overlap) {
    return true;
  }

  return false;
};

export const createTrainingPlanAssignment = async (
  userId: string,
  trainingPlanId: string,
  startDate: Date,
  endDate?: Date
): Promise<HydratedDocument<ITrainingPlanAssignment>> => {
  const assignedPlan = await TrainingPlanAssignment.create({
    user: userId,
    trainingPlan: trainingPlanId,
    startDate: startDate,
    endDate: endDate ?? null,
  });

  return assignedPlan;
};

export const findActiveTrainingPlanAssignment = async (
  userId: string,
  date?: string
): Promise<HydratedDocument<ITrainingPlanAssignment> | null> => {
  const rawDate = date as string | undefined;
  const queryDate = rawDate ? new Date(rawDate) : new Date();
  const { startOfDay, endOfDay } = normalizeDayRange(queryDate);

  const assignment = await TrainingPlanAssignment.findOne({
    user: new mongoose.Types.ObjectId(userId),
    startDate: { $lte: endOfDay },
    $or: [
      { endDate: null },
      { endDate: { $exists: false } },
      { endDate: { $gte: startOfDay } },
    ],
  }).populate("trainingPlan");

  return assignment;
};
