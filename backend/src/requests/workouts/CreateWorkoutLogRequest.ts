import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { ExerciseDTO } from "../trainingplans/CreateTrainingPlanRequest";
import { Type } from "class-transformer";
export class CreateWorkoutLogRequest {
  @IsMongoId()
  @IsNotEmpty()
  trainingPlanId!: string;

  @IsMongoId()
  @IsNotEmpty()
  workoutDayId!: string;

  @IsDate()
  performed?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  exercises!: ExerciseDTO[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  caloriesBurned?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
