import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export class CreatePulseOximeterLogRequest {
  @IsOptional()
  @IsDate()
  timestamp?: Date;

  @IsNumber()
  @IsNotEmpty()
  spo2!: number;

  @IsOptional()
  @Min(20)
  @Max(250)
  bpm?: number;

  @IsIn(["BLE", "SMARTWATCH_API", "MANUAL"])
  @IsNotEmpty()
  source!: "BLE" | "SMARTWATCH_API" | "MANUAL"; //BLE device, smartwatch API
}
