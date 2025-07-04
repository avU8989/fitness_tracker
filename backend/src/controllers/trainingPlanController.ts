import TrainingPlan from "../models/TrainingPlan";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { Error } from "mongoose";
import { CreateTrainingPlanRequest } from "../requests/trainingplans/CreateTrainingPlanRequest";

export const createTrainingPlan = async (
  req: AuthenticatedRequest & { body: CreateTrainingPlanRequest },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, days } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    //logic to create a training plan
    const newPlan = new TrainingPlan({
      name,
      days,
      user: req.user.id,
    });

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
  const { sets, repetitions, weight, unit } = req.body;
  const { planId, dayId, exerciseId } = req.params;

  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }
    const trainingPlan = await TrainingPlan.findOne({
      _id: planId,
      user: req.user.id,
    });

    if (!trainingPlan) {
      res.status(404).json({
        message: "Training plan not found",
      });
      return;
    }

    const trainingDay = trainingPlan.days.id(dayId);
    if (!trainingDay) {
      res.status(404).json({
        message: "Workout day not found",
      });
      return;
    }

    const exercise = trainingDay.exercises.id(exerciseId);
    if (!exercise) {
      res.status(404).json({
        message: "Exercise not found",
      });
      return;
    }

    if (sets !== undefined) exercise.sets = sets;
    if (repetitions !== undefined) exercise.repetitions = repetitions;
    if (weight !== undefined) exercise.weight = weight;

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

  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const trainingPlan = await TrainingPlan.findOne({
      _id: planId,
      user: req.user.id,
    });

    if (!trainingPlan) {
      res.status(404).json({
        message: "Training plan not found",
      });
      return;
    }

    const trainingDay = trainingPlan.days.id(dayId);
    if (!trainingDay) {
      res.status(404).json({
        message: "Workout day not found",
      });
      return;
    }

    if (dayOfWeek) trainingDay.dayOfWeek = dayOfWeek;
    if (splitType) trainingDay.splitType = splitType;
    if (exercises) trainingDay.exercises = exercises;

    await trainingPlan.save();

    res.status(200).json({
      message: "Workout Day updated successfully",
      trainingDay,
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
