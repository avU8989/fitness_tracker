import TrainingPlan from "../models/TrainingPlan";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Error } from "mongoose";
import {
  CreateBaseTrainingPlanRequest,
  CreatePowerliftingPlanRequest,
} from "../requests/trainingplans/CreateTrainingPlanRequest";
import PowerLiftingPlan from "../models/PowerliftingPlan";
import CrossfitPlan from "../models/CrossfitPlan";
import BodybuildingPlan from "../models/BodybuildingPlan";
import { findWorkoutDay, loadUserPlan } from "./trainingPlan-helpers";

export const createTrainingPlan = async (
  req: AuthenticatedRequest & {
    body: CreateBaseTrainingPlanRequest | CreatePowerliftingPlanRequest;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, days, type } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const baseFields = {
      name,
      type,
      user: req.user.id,
    };

    let newPlan;
    const normalizedType = type?.toLowerCase();
    console.log("THIW IS THE");

    console.log(normalizedType);

    if (!normalizedType) {
      newPlan = new TrainingPlan(baseFields); // fallback
    } else {
      switch (normalizedType) {
        case "powerlifting":
          console.log("Creating Powerlifting Plan");
          newPlan = new PowerLiftingPlan({
            ...baseFields,
            ...req.body, //includes blockPeriodization weeks, etc
          });
          break;
        case "crossfit":
          console.log("Creating Crossfit Plan");
          newPlan = new CrossfitPlan({
            ...baseFields,
            days,
          });
          break;
        case "bodybuilding":
          console.log("Creating Bodybuilding Plan");
          newPlan = new BodybuildingPlan({
            ...baseFields,
            days,
          });
          break;
        default:
          res.status(400).json({ message: "Invalid training plan type" });
          return;
      }
    }
    await newPlan.save();

    console.log("Successfully created training plan");

    res.status(201).json({
      message: "Training plan created",
      plan: newPlan,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getTrainingPlans = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const plans = await TrainingPlan.find({ user: req.user.id });
    console.log(plans);
    res.status(200).json(plans);
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateExercise = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { sets, repetitions, weight, unit, name } = req.body;
  const { planId, dayId, exerciseId } = req.params;
  const { weekId, weekNumber } = req.query as {
    weekId?: string;
    weekNumber?: number;
  };

  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }
    const trainingPlan = await loadUserPlan(req.user.id, planId);

    if (!trainingPlan) {
      res.status(404).json({
        message: "Training plan not found",
      });
      return;
    }

    const { day } = findWorkoutDay(trainingPlan, {
      dayId,
      weekId,
      weekNumber: weekNumber ? Number(weekNumber) : undefined,
    });

    if (!day) {
      res.status(404).json({
        message: "Workout day not found",
      });
      return;
    }

    const exercise = day.exercises.id(exerciseId);
    if (!exercise) {
      res.status(404).json({
        message: "Exercise not found",
      });
      return;
    }

    if (name !== undefined) exercise.name = name;
    if (sets !== undefined) exercise.sets = sets;
    if (repetitions !== undefined) exercise.repetitions = repetitions;
    if (weight !== undefined) exercise.weight = weight;
    if (unit !== undefined) exercise.unit = unit;

    await trainingPlan.save();

    res.status(200).json({
      message: "Exercise updated successfully",
      exercise,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const updateWorkoutDay = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { dayId, planId } = req.params;
  const { dayOfWeek, splitType, exercises } = req.body;
  const { weekId, weekNumber } = req.query as {
    weekId?: string;
    weekNumber?: number;
  };

  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const trainingPlan = await loadUserPlan(req.user.id, planId);

    if (!trainingPlan) {
      res.status(404).json({
        message: "Training plan not found",
      });
      return;
    }

    const { day } = findWorkoutDay(trainingPlan, {
      dayId,
      weekId,
      weekNumber: weekNumber ? Number(weekNumber) : undefined,
    });

    if (!day) {
      res.status(404).json({
        message: "Workout day not found",
      });
      return;
    }

    if (dayOfWeek) day.dayOfWeek = dayOfWeek;
    if (splitType) day.splitType = splitType;
    if (exercises) day.exercises = exercises;

    await trainingPlan.save();

    res.status(200).json({
      message: "Workout Day updated successfully",
      day,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

//Delete trainingplan
export const deleteTrainingPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { planId } = req.params;

  try {
    if (!req.user?.id) {
      res.status(401).json({ messge: "Unauthorized: User id missing" });
      return;
    }

    const deleted = await TrainingPlan.findOneAndDelete({
      _id: planId,
      user: req.user.id,
    });

    if (!deleted) {
      res
        .status(404)
        .json({ message: "Training plan not found or unauthorized" });
      return;
    }

    res.status(200).json({ message: "Training plan deleted successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const getTodaysWorkout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized: User id missing" });
      return;
    }
    const userId = req.user.id;

    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();
    const plan = await TrainingPlan.findOne({ user: userId });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
