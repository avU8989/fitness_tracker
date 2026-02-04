import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { PlanExerciseDTO } from "requests/trainingplans/CreateTrainingPlanRequest";

export class CreateWorkoutTemplateRequest {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    splitType!: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PlanExerciseDTO)
    exercises?: PlanExerciseDTO[];
};