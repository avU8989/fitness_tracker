import { Type } from "class-transformer";
import {
  IsOptional,
  IsEnum,
  IsString,
  IsArray,
  ValidateNested,
  IsEmpty,
} from "class-validator";
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  ExerciseDTO,
} from "./CreateTrainingPlanRequest";

export class UpdateWorkoutDayRequest {
  @IsEmpty()
  @IsEnum(DAYS_OF_WEEK)
  dayOfWeek!: DayOfWeek;

  @IsEmpty()
  @IsString()
  splitType!: string;

  @IsEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  exercises!: ExerciseDTO[];
}
