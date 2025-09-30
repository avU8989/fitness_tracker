export interface CreatePhysicalActivityLogRequest {
  timestamp?: Date;
  steps: number;
  distance?: number;
  energyExpended?: number;
  source: "BLE" | "SMARTWATCH_API" | "MANUAL";
}
