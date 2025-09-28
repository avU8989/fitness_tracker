import { HydratedDocument } from "mongoose";
import BodybuildingPlan, {
  IBodybuildingPlan,
} from "../models/BodybuildingPlan";
import CrossfitPlan, { ICrossfitPlan } from "../models/CrossfitPlan";
import PowerLiftingPlan, {
  IPowerliftingPlan,
} from "../models/PowerliftingPlan";
import TrainingPlan, {
  IExercise,
  ITrainingPlan,
  IWorkoutDay,
} from "../models/TrainingPlan";
import {
  CreateBaseTrainingPlanRequest,
  CreatePowerliftingPlanRequest,
} from "../requests/trainingplans/CreateTrainingPlanRequest";
import { UpdateExerciseRequest } from "../requests/trainingplans/UpdateExerciseRequest";
import { UpdateWorkoutDayRequest } from "../requests/trainingplans/UpdateWorkoutDayRequest";
import { findWorkoutDay, loadUserPlan } from "../utils/trainingPlan-helpers";

export const createTrainingPlan = async (
  userId: string,
  data: CreateBaseTrainingPlanRequest | CreatePowerliftingPlanRequest
) => {
  const { name, type } = data;

  const baseFields = {
    name,
    type,
    user: userId,
  };

  let newPlan;
  const normalizedType = type?.toLowerCase();

  if (!normalizedType) {
    newPlan = new TrainingPlan(baseFields); // fallback
  } else {
    switch (normalizedType) {
      case "powerlifting":
        console.log("Creating Powerlifting Plan");
        newPlan = new PowerLiftingPlan({
          ...baseFields,
          ...data, //includes blockPeriodization weeks, etc
        });
        break;
      case "crossfit":
        console.log("Creating Crossfit Plan");
        newPlan = new CrossfitPlan({
          ...baseFields,
          days: (data as CreateBaseTrainingPlanRequest).days,
        });
        break;
      case "bodybuilding":
        console.log("Creating Bodybuilding Plan");
        newPlan = new BodybuildingPlan({
          ...baseFields,
          days: (data as CreateBaseTrainingPlanRequest).days,
        });
        break;
      default:
        newPlan = new TrainingPlan(baseFields);
        break;
    }
  }

  return newPlan.save();
};

export const getTrainingPlansByUserId = async (userId: string) => {
  return TrainingPlan.find({ user: userId });
};

export const getTrainingPlanById = async (trainingPlanId: string) => {
  return TrainingPlan.findById(trainingPlanId);
};

export const fetchTotalPlans = async (userId: string): Promise<number> => {
  return TrainingPlan.countDocuments({ user: userId });
};

interface UpdateExerciseParams {
  userId: string;
  planId: string;
  dayId: string;
  exerciseId: string;
  update: UpdateExerciseRequest;
  weekId?: string;
  weekNumber?: number;
}

export const updateExercise = async (
  params: UpdateExerciseParams
): Promise<IExercise> => {
  const { userId, planId, dayId, exerciseId, update, weekId, weekNumber } =
    params;
  const trainingPlan = await loadUserPlan(userId, planId);

  if (!trainingPlan) {
    throw new Error("Training plan not found");
  }

  const { day } = findWorkoutDay(trainingPlan, {
    dayId,
    weekId,
    weekNumber,
  });

  if (!day) {
    throw new Error("Workout day not found");
  }

  const exercise = day.exercises.id(exerciseId);
  if (!exercise) {
    throw new Error("Exercise not found");
  }

  if (update.name !== undefined) exercise.name = update.name;
  if (update.sets !== undefined) exercise.sets = update.sets;

  await trainingPlan.save();
  return exercise.toObject() as IExercise;
};

interface UpdateWorkoutDayParams {
  userId: string;
  dayId: string;
  planId: string;
  update: UpdateWorkoutDayRequest;
  weekId?: string;
  weekNumber?: number;
}

export const updateWorkoutDay = async (
  params: UpdateWorkoutDayParams
): Promise<IWorkoutDay> => {
  const { userId, dayId, planId, update, weekId, weekNumber } = params;
  const trainingPlan = await loadUserPlan(userId, planId);

  if (!trainingPlan) {
    throw new Error("Training plan not found");
  }

  const { day } = findWorkoutDay(trainingPlan, {
    dayId,
    weekId,
    weekNumber,
  });

  if (!day) {
    throw new Error("Workout day not found");
  }

  if (update.dayOfWeek !== undefined) day.dayOfWeek = update.dayOfWeek;
  if (update.splitType !== undefined) day.splitType = update.splitType;
  if (update.exercises !== undefined) day.exercises = update.exercises;

  await trainingPlan.save();

  return day.toObject() as IWorkoutDay;
};

export const removeTrainingPlan = async (userId: string, planId: string) => {
  const deleted = await TrainingPlan.findOneAndDelete({
    _id: planId,
    user: userId,
  });

  return !!deleted;
};

export const hasTrainingPlan = async (
  userId: string,
  trainingPlanId: string
): Promise<boolean> => {
  const planExists = await TrainingPlan.exists({
    _id: trainingPlanId,
    user: userId,
  });

  return !!planExists;
};

export const getWorkoutDayFromPlan = async (
  trainingPlan: HydratedDocument<ITrainingPlan>,
  workoutDayId: string
): Promise<IWorkoutDay | null> => {
  if (
    trainingPlan.type === "Bodybuilding" ||
    trainingPlan.type === "Crossfit"
  ) {
    //cast to unknown because of not exisitng days in ITrainingPlan
    const plan = trainingPlan as unknown as IBodybuildingPlan | ICrossfitPlan;
    //IBodyBuildingPlan and ICrossfitPlan has days
    //need to have days as DocumentArray to fetch the id, so TS knows id exists from mongo
    return plan.days.id(workoutDayId) ?? null;
  }

  if (trainingPlan.type === "Powerlifting") {
    const powerliftingPlan = trainingPlan as unknown as IPowerliftingPlan;
    for (const week of powerliftingPlan.weeks) {
      const found = week.days.id(workoutDayId);

      if (found) return found;
    }
  }

  return null;
};
