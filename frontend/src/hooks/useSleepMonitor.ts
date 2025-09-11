import { useEffect, useRef, useState } from "react";
import { useBleDevice } from "../context/BleContext";
import { Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { handleCharacteristic, Parser } from "../utils/bleParser";

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

// Mocked sleep data no official Bluetooth SIG spec --> like vendor-specific service
// [Stage][Duration_Lo][Duration_Hi][HR][REM%][Light%][Deep%]
const parseSleepActivity: Parser<SleepData> = (
  base64Value: string
): SleepData | null => {
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
    console.warn("[Parser] Failed to parse payload:", e);
    return null;
  }
};

export function useSleepMonitor() {
  const { device } = useBleDevice();
  const [sleepData, setData] = useState<SleepData>({
    stage: null,
    duration: null,
    heartRate: null,
    remRate: null,
    lightSleepRate: null,
    deepSleepRate: null,
  });

  const lastUpdateRef = useRef(0);

  useEffect(() => {
    console.log("[Hook] useSleepMonitor mounted");
    if (!device) {
      console.log("[Hook] No BLE device available yet");
      return;
    }
    let lastUpdate = 0; // local variable survives inside this effect only
    // --- Initial one-time READ (if supported) ---
    (async () => {
      try {
        const initialChar = await device.readCharacteristicForService(
          SLEEP_SERVICE,
          SLEEP_ACTIVITY
        );
        handleCharacteristic(
          initialChar,
          parseSleepActivity,
          (parsed) => setData(parsed),
          "InitialRead"
        );
      } catch (err) {
        console.warn("[InitialRead] Failed:", err);
      }
    })();

    // --- Subscribe for continuous updates ---
    console.log("[Hook] Subscribing to SleepActivity characteristic...");
    const sub = device.monitorCharacteristicForService(
      SLEEP_SERVICE,
      SLEEP_ACTIVITY,
      (err, characteristic: Characteristic | null) => {
        if (err) {
          console.warn("[Monitor] Could not monitor SleepActivity:", err);
          return;
        }

        const now = Date.now();
        if (now - lastUpdateRef.current < 1000) {
          console.log("[Monitor] Skipping update (too soon)");
          return;
        }
        lastUpdateRef.current = now;

        handleCharacteristic(
          characteristic,
          parseSleepActivity,
          (parsed) => setData(parsed),
          "Notify"
        );
      }
    );

    return () => {
      console.log("[Hook] Cleaning up subscription for Sleep Monitor");
      sub?.remove();
    };
  }, [device]);

  return sleepData;
}
