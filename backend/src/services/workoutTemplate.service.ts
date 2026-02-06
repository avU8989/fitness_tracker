import WorkoutTemplate from "../models/WorkoutTemplate";
import { CreateWorkoutTemplateRequest } from "../requests/workout_templates/CreateWorkoutTemplateRequest";

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

