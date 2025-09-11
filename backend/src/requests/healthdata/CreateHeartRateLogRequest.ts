import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export class CreateHeartRateLogRequest {
  @IsDate()
  @IsOptional()
  timestamp?: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(20)
  @Max(250)
  bpm!: number;

  @IsIn(["BLE", "SMARTWATCH_API", "MANUAL"])
  @IsNotEmpty()
  source!: string;
}
