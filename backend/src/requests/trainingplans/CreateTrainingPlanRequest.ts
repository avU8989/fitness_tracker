import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsIn,
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

class SetDTO {
  @IsNumber()
  @IsNotEmpty()
  reps!: number;

  @IsNumber()
  @IsNotEmpty()
  weight!: number;

  @IsEnum(Units)
  @IsNotEmpty()
  unit!: Unit;
}

class ExerciseDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDTO)
  sets!: SetDTO[];
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

export class CreateBaseTrainingPlanRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsIn(["Bodybuilding", "Crossfit"])
  type?: "Bodybuilding" | "Crossfit";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutDayDTO)
  days!: WorkoutDayDTO[];
}

class PowerWeekDTO {
  @IsNumber()
  @IsNotEmpty()
  weekNumber!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutDayDTO)
  days!: WorkoutDayDTO[];
}

export class CreatePowerliftingPlanRequest {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(["Powerlifting"])
  type!: "Powerlifting";

  @IsBoolean()
  blockPeriodization?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PowerWeekDTO)
  weeks!: PowerWeekDTO[];

  @IsOptional()
  @IsArray()
  weeklyFocusNotes?: string[];

  @IsOptional()
  @IsArray()
  accessoryFocus?: string[];

  @IsOptional()
  @IsBoolean()
  competitionPrep?: boolean;

  @IsIn(["Volume", "Intensity", "Peaking"])
  intensityPhase!: "Volume" | "Intensity" | "Peaking";
}
