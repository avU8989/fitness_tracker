import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { SetDTO } from "./CreateTrainingPlanRequest";
import { Type } from "class-transformer";

export class UpdateExerciseRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDTO)
  sets?: SetDTO[];
}
