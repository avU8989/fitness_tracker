export interface CreatePulseOximeterLogRequest {
  timestamp?: Date;
  spo2: number;
  bpm?: number;
  source: "BLE" | "SMARTWATCH_API" | "MANUAL";
}
