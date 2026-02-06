import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "middleware/auth";
import { CreateWorkoutTemplateRequest } from "../requests/workout_templates/CreateWorkoutTemplateRequest";
import { createWorkoutTemplate } from "../services/workoutTemplate.service";


//POST /workout-templates - Create a new workout template
export const postWorkoutTemplate = async (
    req: AuthenticatedRequest & { body: CreateWorkoutTemplateRequest },
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User ID missing" });
            return;
        }

        const workoutTemplate = await createWorkoutTemplate(userId, req.body);

        res.status(201).json({ message: "Workout Template created succesfully", workoutTemplate: workoutTemplate });
        return;

    } catch (err: any) {
        //for now no global error handling
        console.error("Unexpected error creating workout template:", err);

        if (err?.message?.includes("already exist")) {
            res.status(409).json({ message: err.message });
            return;
        }

        res.status(500).json({ message: "Internal server error" });
    }
}
