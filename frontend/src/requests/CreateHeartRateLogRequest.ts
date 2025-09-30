export interface CreateHeartRateLogRequest {
  timestamp?: Date;
  bpm: number;
  source: "BLE" | "SMARTWATCH_API" | "MANUAL";
}
