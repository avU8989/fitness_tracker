import TrainingPlan from "models/TrainingPlan";
import WorkoutTemplate from "models/WorkoutTemplate";
import { CreateWorkoutTemplateRequest } from "requests/workout_templates/CreateWorkoutTemplateRequest";

//error helpers --> TODO add global error handling for better maintenace
class NotFoundError extends Error { };
class ForbiddenError extends Error { };
class ConflictError extends Error { };

export const createWorkoutTemplate = async (
    userId: string,
    data: CreateWorkoutTemplateRequest
) => {
    try {
        const { name, splitType, exercises } = data;
        //create the workout template
        const workoutTemplate = await WorkoutTemplate.create({
            user: userId,
            name: name,
            splitType: splitType,
            exercises: exercises
        });

        return workoutTemplate;
    } catch (err: any) {
        if (err?.code === 11000) {
            throw new ConflictError("Workout template already exist");
        }
        throw err;
    }
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

    if (result.matchedCount === 0) {
        throw new NotFoundError("Training plan not found");
    }

    return { ok: true };
}

