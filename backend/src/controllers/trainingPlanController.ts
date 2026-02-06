import TrainingPlan from "../models/TrainingPlan";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  CreateBaseTrainingPlanRequest,
  CreatePowerliftingPlanRequest,
} from "../requests/trainingplans/CreateTrainingPlanRequest";
import {
  createTrainingPlan,
  updateWorkoutDay,
  getTrainingPlansByUserId,
  updateExercise,
  removeTrainingPlan,
  fetchTotalPlans,
  attachWorkoutTemplateToPlan,
  fetchWorkoutTemplatesFromPlan,
} from "../services/trainingPlan.service";
import { UpdateExerciseRequest } from "../requests/trainingplans/UpdateExerciseRequest";
import { UpdateWorkoutDayRequest } from "../requests/trainingplans/UpdateWorkoutDayRequest";
import { CreateWorkoutTemplateRequest } from "../requests/workout_templates/CreateWorkoutTemplateRequest";
import { createWorkoutTemplate } from "../services/workoutTemplate.service";

export const postTrainingPlan = async (
  req: AuthenticatedRequest & {
    body: CreateBaseTrainingPlanRequest | CreatePowerliftingPlanRequest;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const plan = await createTrainingPlan(req.user.id, req.body);
    console.log("Successfully created training plan");

    res.status(201).json({
      message: "Training plan created",
      plan: plan,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// POST - /training-plans/:planId/workout-templates
export const postWorkoutTemplateInTrainingPlan = async (
  req: AuthenticatedRequest & {
    body: CreateWorkoutTemplateRequest
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { planId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    if (!planId) {
      res.status(400).json({ message: "Trainingplan id is missing" });
      return;
    }


    const workoutTemplate = await createWorkoutTemplate(userId, req.body);

    console.log(workoutTemplate);


    const { ok } = await attachWorkoutTemplateToPlan(userId, planId, workoutTemplate.id);

    if (ok) {
      res.status(201).json({ message: "Workout Template created in Training plan succesfully", workoutTemplate: workoutTemplate })
      return;
    }
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// GET - /training-plans/:planId/workout-templates
export const getWorkoutTemplatesFromTrainingPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {


    const userId = req.user?.id;
    const { planId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    if (!planId) {
      res.status(400).json({ message: "Trainingplan id is missing" });
      return;
    }

    const { workoutTemplates } = await fetchWorkoutTemplatesFromPlan(userId, planId);

    res.status(200).json({ workoutTemplates: workoutTemplates });
  }
  catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    })
  }
}

export const getTrainingPlans = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  res.removeHeader("ETag");
  res.removeHeader("Last-Modified");

  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const plans = await getTrainingPlansByUserId(req.user.id);
    res.status(200).json(plans);
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const patchExercise = async (
  req: AuthenticatedRequest & {
    body: UpdateExerciseRequest;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const exercise = await updateExercise({
      userId: req.user.id,
      planId,
      dayId,
      exerciseId,
      update: req.body,
      weekId,
      weekNumber: weekNumber ? Number(weekNumber) : undefined,
    });

    res.status(200).json({
      message: "Exercise updated successfully",
      data: exercise,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const putWorkoutDay = async (
  req: AuthenticatedRequest & {
    body: UpdateWorkoutDayRequest;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { dayId, planId } = req.params;
  const { weekId, weekNumber } = req.query as {
    weekId?: string;
    weekNumber?: number;
  };

  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    const day = await updateWorkoutDay({
      userId: req.user.id,
      dayId,
      planId,
      update: req.body,
      weekId,
      weekNumber: weekNumber ? Number(weekNumber) : undefined,
    });

    res.status(200).json({
      message: "Workout Day updated successfully",
      data: day,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getTotalPlans = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ messge: "Unauthorized: User id missing" });
      return;
    }

    const totalPlans = await fetchTotalPlans(req.user.id);

    res.status(200).json({ totalPlans: totalPlans });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
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

    const wasDeleted = await removeTrainingPlan(req.user.id, planId);

    if (!wasDeleted) {
      res.status(404).json({ message: "Training plan not found" });
      return;
    }

    res.status(200).json({ message: "Training plan deleted successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
