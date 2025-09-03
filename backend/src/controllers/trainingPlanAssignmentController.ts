import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import User from "../models/User";
import TrainingPlan from "../models/TrainingPlan";
import TrainingPlanAssignment from "../models/PlanAssignment";
import { start } from "repl";

//POST /trainingPlanAssignments - Create an assignemnt from a user to a trainigsplan
export const createTrainingPlanAssignment = async (
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

    //find trainingPlan by ID
    const planExists = await TrainingPlan.exists({
      _id: trainingPlanId,
      user: userId,
    });

    if (!planExists) {
      res
        .status(401)
        .json({ message: "Trainingplan to be assigned not found" });
      return;
    }

    //TODO still need to check date

    //overlap prevention - user cannot have two trainingplans active at the same time
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
      res.status(409).json({ message: "Overlapping assignments exists" });
    }

    const assignedPlan = await TrainingPlanAssignment.create({
      user: userId,
      trainingPlan: trainingPlanId,
      startDate: startDate,
      endDate: endDate ?? null,
    });

    res.status(201).json({ message: "Trainigplan assigned!", assignedPlan });
    return;
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
    return;
  }
};

export const getActivePlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  const date = req.query.date ? new Date(String(req.query.date)) : new Date();
  try {
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User Id missing" });
      return;
    }

    const assignment = await TrainingPlanAssignment.findOne({
      user: userId,
      startDate: { $lte: date },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: date } }],
    }).populate("trainingPlan");

    if (!assignment) {
      res.status(404).json({ message: "Could not find active plan" });
      return;
    }

    res.status(200).json(assignment);
    return;
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};
