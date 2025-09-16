import TrainingPlanAssignment from "../models/PlanAssignment";
import { ITrainingPlan } from "../models/TrainingPlan";
import mongoose, { HydratedDocument } from "mongoose";
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
