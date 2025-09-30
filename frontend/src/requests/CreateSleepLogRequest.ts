export interface SleepStagesDTO {
  rem: number;
  light: number;
  deep: number;
}

export interface CreateSleepLogRequest {
  timestamp?: Date;
  duration: number;
  stages: SleepStagesDTO;
  source: "BLE" | "SMARTWATCH_API" | "MANUAL";
  heartRateDuringSleep: number;
}
