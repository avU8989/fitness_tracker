import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import TrainingPlan from "../models/TrainingPlan";
import TrainingPlanAssignment from "../models/PlanAssignment";
import {
  createTrainingPlanAssignment,
  findActiveTrainingPlanAssignment,
  hasOverlappingTrainingPlan,
  removeTrainingPlanAssignment,
} from "../services/trainingPlanAssignment.service";
import { hasTrainingPlan } from "../services/trainingPlan.service";

//TODO needs refactoring
//POST /trainingPlanAssignments - Create an assignemnt from a user to a trainigsplan
export const postTrainingPlanAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { trainingPlanId, startDate, endDate } = req.body;
  const userId = req.user?.id;
  try {
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    if (!trainingPlanId || !startDate) {
      res
        .status(400)
        .json({ message: "TrainingPlan id and start date are required!" });
      return;
    }

    if (!hasTrainingPlan(userId, trainingPlanId)) {
      res
        .status(404)
        .json({ message: "Cannot assign: training plan not found" });
      return;
    }

    //TO-DO still need to check date

    if (await hasOverlappingTrainingPlan(userId, startDate, endDate)) {
      res.status(409).json({ message: "Overlapping assignments exists" });
      return;
    }

    const assignedPlan = await createTrainingPlanAssignment(
      userId,
      trainingPlanId,
      startDate,
      endDate
    );

    res.status(201).json({ message: "Trainigplan assigned!", assignedPlan });
    return;
  } catch (err: any) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
    return;
  }
};

export const deleteTrainingPlanAssignment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { planId } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    const deleted = await removeTrainingPlanAssignment(userId, planId);

    if (!deleted) {
      res.status(404).json({ message: "Deleting Training plan failed" });
    }

    res.status(200).json({ message: "Training assignment deleted successfully" });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getActivePlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  res.removeHeader("ETag");
  res.removeHeader("Last-Modified");

  const userId = req.user?.id;
  const date = req.query.date as string | undefined;

  try {
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    const assignment = await findActiveTrainingPlanAssignment(userId, date);

    if (!assignment) {
      res.status(404).json({ message: "Could not find active plan" });
      return;
    }

    res.status(200).json(assignment);
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
