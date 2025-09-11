import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";

export class CreatePhysicalActivityLogRequest {
  @IsOptional()
  @IsDate()
  timestamp?: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  steps!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  distance?: number; //in meters

  @IsOptional()
  @IsNumber()
  @Min(0)
  energyExpended?: number; //in kJ

  @IsIn(["BLE", "SMARTWATCH_API", "MANUAL"])
  @IsNotEmpty()
  source!: string; //BLE device, smartwatch API
}
