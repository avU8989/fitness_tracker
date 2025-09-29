import TrainingPlanAssignment, {
  ITrainingPlanAssignment,
} from "../models/PlanAssignment";
import { ITrainingPlan } from "../models/TrainingPlan";
import mongoose, { HydratedDocument, Document } from "mongoose";
import { normalizeDayRange } from "../utils/controllerUtils";

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
): Promise<(HydratedDocument<ITrainingPlan> & any) | null> => {
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
  }).populate<{ trainingPlan: HydratedDocument<ITrainingPlan> }>(
    "trainingPlan"
  );

  return assignment;
};

export const findUpcomingTrainingPlanAssignment = async (
  userId: string,
  afterDate?: Date
) => {
  const baseDate = afterDate ?? new Date();

  const assignment = await TrainingPlanAssignment.findOne({
    user: new mongoose.Types.ObjectId(userId),
    startDate: { $gte: baseDate },
  })
    .sort({ startDate: 1 })
    .populate<{ trainingPlan: HydratedDocument<ITrainingPlan> }>(
      "trainingPlan"
    );

  return assignment;
};
