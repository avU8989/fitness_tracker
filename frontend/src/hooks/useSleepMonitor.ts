import { useEffect, useRef, useState } from "react";
import { useBleDevice } from "../context/BleContext";
import { Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { parse } from "path";

const SLEEP_SERVICE = "00001111-0000-1000-8000-00805f9b34fb";
const SLEEP_ACTIVITY = "00002b41-0000-1000-8000-00805f9b34fb";

export interface SleepData {
  stage: number | null;
  duration: number | null;
  heartRate: number | null;
  remRate: number | null;
  lightSleepRate: number | null;
  deepSleepRate: number | null;
}

// [Stage][Duration_Lo][Duration_Hi][HR][REM%][Light%][Deep%]
function parseSleepActivity(base64Value: string): SleepData | null {
  try {
    console.log("[Parser] Incoming Base64:", base64Value);

    const raw = Buffer.from(base64Value, "base64");
    const bytes = Array.from(raw.values());

    console.log("[Parser] Bytes:", bytes);

    return {
      stage: bytes[0] ?? null,
      duration: (bytes[1] ?? 0) | ((bytes[2] ?? 0) << 8), // combine low/high
      heartRate: bytes[3] ?? null,
      remRate: bytes[4] ?? null,
      lightSleepRate: bytes[5] ?? null,
      deepSleepRate: bytes[6] ?? null,
    };
  } catch (e) {
    console.error("[Parser] Failed to parse payload:", e);
    return null;
  }
}

export function useSleepMonitor() {
  const { device } = useBleDevice();
  const [data, setData] = useState<SleepData>({
    stage: null,
    duration: null,
    heartRate: null,
    remRate: null,
    lightSleepRate: null,
    deepSleepRate: null,
  });

  const lastUpdateRef = useRef(0);

  const handleCharacteristic = (
    char: Characteristic | null,
    source: string
  ) => {
    if (!char?.value) {
      console.log(`[${source}] Empty characteristic value`);
      return;
    }

    const parsed = parseSleepActivity(char.value);
    if (parsed) {
      setData(parsed);
      console.log(
        `[${source}] Stage: ${parsed.stage}, 
        Duration: ${parsed.duration} min, 
        HeartRate: ${parsed.heartRate} bpm, 
        REM: ${parsed.remRate}%, 
        Light: ${parsed.lightSleepRate}%, 
        Deep: ${parsed.deepSleepRate}%
        ]`
      );
    }
  };

  useEffect(() => {
    console.log("[Hook] useSleepMonitor mounted");
    if (!device) {
      console.log("[Hook] No BLE device available yet");
      return;
    }

    // --- Initial one-time READ (if supported) ---
    (async () => {
      try {
        const initialChar = await device.readCharacteristicForService(
          SLEEP_SERVICE,
          SLEEP_ACTIVITY
        );
        if (initialChar?.value) {
          handleCharacteristic(initialChar, "InitialRead");
        }
      } catch (err) {
        console.error("[InitialRead] Failed:", err);
      }
    })();

    // --- Subscribe for continuous updates ---
    console.log("[Hook] Subscribing to SleepActivity characteristic...");
    const sub = device.monitorCharacteristicForService(
      SLEEP_SERVICE,
      SLEEP_ACTIVITY,
      (err, characteristic: Characteristic | null) => {
        if (err) {
          console.error("[Monitor] Could not monitor SleepActivity:", err);
          return;
        }

        const now = Date.now();
        if (now - lastUpdateRef.current < 1000) {
          console.log("[Monitor] Skipping update (too soon)");
          return;
        }
        lastUpdateRef.current = now;

        handleCharacteristic(characteristic, "Notify");
      }
    );

    return () => {
      console.log("[Hook] Cleaning up subscription");
      sub?.remove();
    };
  }, [device]);

  return data;
}
