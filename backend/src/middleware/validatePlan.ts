import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { CreatePowerliftingPlanRequest } from "../requests/trainingplans/CreateTrainingPlanRequest";
import { CreateBaseTrainingPlanRequest } from "../requests/trainingplans/CreateTrainingPlanRequest";


//we need to specify type for DTO because it will be a union of more than two different class constructors, fix this
//by having DTO asa generic class constructor

type AnyDTO = ClassConstructor<object>;

export async function validateCreateTrainingPlan(req: Request, res: Response, next: NextFunction) {
    const t = (req.body?.type ?? "").toString();

    //if type is missing treate as base plan days[]
    //if crossfit/bodybuilding still simple plan, depends upon future modifications
    //if powerlifting type --> periodization for week blocks

    let DTO: AnyDTO;

    switch (t.toLowerCase()) {
        case "powerlifting":
            DTO = CreatePowerliftingPlanRequest;
            break;
        case "bodybuilding":
            DTO = CreateBaseTrainingPlanRequest;
            break;
        case "crossfit":
            DTO = CreateBaseTrainingPlanRequest;
            break;
        default:
            DTO = CreateBaseTrainingPlanRequest;
    }

    const dtoObj = plainToInstance(DTO, req.body);

    const errors = await validate(dtoObj, { whitelist: true, forbidNonWhitelisted: false })

    if (errors.length > 0) {
        const messages = errors.flatMap(e => Object.values(e.constraints ?? {}));
        res.status(400).json({ message: "Validation failed", errors: messages })
        return;
    } else {
        next();
    }
}