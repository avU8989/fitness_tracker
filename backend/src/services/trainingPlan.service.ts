import { HydratedDocument } from "mongoose";
import BodybuildingPlan, {
  IBodybuildingPlan,
} from "../models/BodybuildingPlan";
import CrossfitPlan, { ICrossfitPlan } from "../models/CrossfitPlan";
import PowerLiftingPlan, {
  IPowerliftingPlan,
} from "../models/PowerliftingPlan";
import TrainingPlan, {
  ITrainingPlan,
  IWorkoutDay,
} from "../models/TrainingPlan";
import {
  CreateBaseTrainingPlanRequest,
  CreatePowerliftingPlanRequest,
  WorkoutDayDTO,
} from "../requests/trainingplans/CreateTrainingPlanRequest";
import { UpdateExerciseRequest } from "../requests/trainingplans/UpdateExerciseRequest";
import { UpdateWorkoutDayRequest } from "../requests/trainingplans/UpdateWorkoutDayRequest";
import { findWorkoutDay, loadUserPlan, mapDaysWithExercises } from "../utils/trainingPlan-helpers";
import { IExercise } from "../models/Exercise";
import WorkoutTemplate from "../models/WorkoutTemplate";

class NotFoundError extends Error { };

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

  const normalizedType = type?.toLowerCase();
  let newPlan;

  if (normalizedType === "powerlifting") {
    if (!("weeks" in data)) {
      throw new Error("Powerlifting plan must include weeks");
    }

    const weeks = await Promise.all(
      data.weeks.map(async (week) => ({
        weekNumber: week.weekNumber,
        days: await mapDaysWithExercises(week.days),
      }))
    );

    newPlan = new PowerLiftingPlan({
      ...baseFields,
      ...data,
      weeks,
    });
  }
  else {
    if (!("days" in data) || !Array.isArray(data.days)) {
      throw new Error("Training plan must include days");
    }

    const days = await mapDaysWithExercises(data.days);

    switch (normalizedType) {
      case "crossfit":
        newPlan = new CrossfitPlan({ ...baseFields, days });
        break;
      case "bodybuilding":
        newPlan = new BodybuildingPlan({ ...baseFields, days });
        break;
      default:
        newPlan = new TrainingPlan(baseFields);
    }
  }

  return newPlan.save();
};


export const getTrainingPlansByUserId = async (userId: string) => {
  return TrainingPlan.find({ user: userId }).populate({
    path: "days.exercises.exercise",
    select: "name primaryMuscles equipment secondaryMuscles"
  });
};

export const getTrainingPlanById = async (trainingPlanId: string) => {
  //actually need to populate the referenced objects before fetching the whole trainingplan --> TODO 
  //add user verification here --> does the trainingplan belong to the user ? --> TODO
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

  const { day } = await findWorkoutDay(trainingPlan, {
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

  const { day } = await findWorkoutDay(trainingPlan, {
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

//if user wants to attach workout template e.g. from setting to another training plan
export const attachWorkoutTemplateToPlan = async (
  userId: string,
  trainingPlanId: string,
  workoutTemplateId: string
) => {
  //ensure the workout template exist and belongs to user
  const workoutTemplate = await WorkoutTemplate.findOne({
    _id: workoutTemplateId,
    user: userId
  }).select("_id");

  if (!workoutTemplate) {
    throw new NotFoundError("Workout template not found");
  }

  //attach to training plan owned by user --> prevents attaching to other user's plans
  const result = await TrainingPlan.updateOne(
    { _id: trainingPlanId, user: userId },
    { $addToSet: { workoutTemplateIds: workoutTemplate._id } }
  );

  console.log(result);

  if (result.matchedCount === 0) {
    throw new NotFoundError("Training plan not found");
  }

  return { ok: true };
}

//fetch workout templates assigned to the specific training plan
export const fetchWorkoutTemplatesFromPlan = async (
  userId: string,
  trainingPlanId: string
) => {
  const trainingPlan = await TrainingPlan.findOne({ _id: trainingPlanId, user: userId })
    .select("workoutTemplateIds")
    .populate({ path: "workoutTemplateIds", select: "name splitType exercises updatedAt" })
    .lean();

  if (!trainingPlan) {
    throw new NotFoundError("Training plan not found");
  }

  //return the full populated workout templates
  return { workoutTemplates: trainingPlan.workoutTemplateIds };
}

