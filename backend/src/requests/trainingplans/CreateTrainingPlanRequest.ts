import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
import "reflect-metadata";

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

const Units = ["kg", "lbs"] as const;
type Unit = (typeof Units)[number];

class ExerciseDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  sets!: number;

  @IsNumber()
  @IsNotEmpty()
  repetitions!: number; // fixed plural here

  @IsNumber()
  @IsNotEmpty()
  weight!: number;

  @IsEnum(Units)
  @IsNotEmpty()
  unit!: Unit;
}

export class WorkoutDayDTO {
  @IsEnum(DAYS_OF_WEEK)
  dayOfWeek!: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  splitType!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  exercises!: ExerciseDTO[];
}

export class CreateTrainingPlanRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutDayDTO)
  days!: WorkoutDayDTO[];
}
