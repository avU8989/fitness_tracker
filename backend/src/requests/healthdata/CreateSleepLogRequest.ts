import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

class SleepStagesDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  rem!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  light!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  deep!: number;
}

export class CreateSleepLogRequest {
  @IsOptional()
  @IsDate()
  timestamp?: Date;

  @IsNumber()
  @IsNotEmpty()
  duration!: number; // minutes or seconds?

  @ValidateNested()
  @Type(() => SleepStagesDTO)
  stages!: SleepStagesDTO;

  @IsIn(["BLE", "SMARTWATCH_API", "MANUAL"])
  @IsNotEmpty()
  source!: string;

  @IsNotEmpty()
  @IsNumber()
  heartRateDuringSleep!: number;
}
