import { useEffect, useRef, useState } from "react";
import { useBleDevice } from "../context/BleContext";
import { Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { handleCharacteristic, Parser } from "../utils/bleParser";

const PHYSICAL_ACTIVITY_SERVICE = "0000183E-0000-1000-8000-00805f9b34fb";
const STEP_COUNTER = "00002b40-0000-1000-8000-00805f9b34fb";

export interface PhysicalData {
  stepCounter: number | null;
  strideLength: number | null; //in cm
  distance: number | null; // in m
  duration: number | null; // in s
  energyExpended: number | null; // in kJ
  met: number | null;
}

//[Step Count][String Length][Distance][Duration of Activity][Energy Expended][Metabolic Equivalent]
//Bluetooth SIG Health Service

export const parsePhysicalActivity = (
  base64Value: string
): PhysicalData | null => {
  if (!base64Value) return null;

  try {
    const buf = Buffer.from(base64Value, "base64");
    let offset = 0;

    // Flags (1 byte bitfield)
    const flags = buf.readUInt8(offset);
    offset += 1;

    // Step Count (always present)
    const stepCounter = buf.readUInt32LE(offset);
    offset += 4;

    // Stride Length (bit 0)
    let strideLength: number | null = null;
    if (flags & 0x01) {
      strideLength = buf.readUInt16LE(offset);
      offset += 2;
    }

    // Distance (bit 1)
    let distance: number | null = null;
    if (flags & 0x02) {
      distance = buf.readUInt32LE(offset);
      offset += 4;
    }

    // Duration (always present)
    const duration = buf.readUInt16LE(offset);
    offset += 2;

    // Energy Expended (bit 2)
    let energyExpended: number | null = null;
    if (flags & 0x04) {
      energyExpended = buf.readUInt16LE(offset);
      offset += 2;
    }

    // MET (bit 3)
    let met: number | null = null;
    if (flags & 0x08) {
      met = buf.readUInt16LE(offset);
      offset += 2;
    }

    return {
      stepCounter,
      strideLength,
      distance,
      duration,
      energyExpended,
      met,
    };
  } catch (err) {
    console.error("Failed to parse Physical Activity payload:", err);
    return null;
  }
};

export function usePhysicalActivityMonitor() {
  const { device } = useBleDevice();
  const [physicalActivityData, setData] = useState<PhysicalData>({
    stepCounter: null,
    strideLength: null,
    distance: null,
    duration: null,
    energyExpended: null,
    met: null,
  });
  const lastUpdateRef = useRef(0);


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
          PHYSICAL_ACTIVITY_SERVICE,
          STEP_COUNTER
        );
        handleCharacteristic(
          initialChar,
          parsePhysicalActivity,
          (parsed) => setData(parsed),
          "InitialRead"
        );
      } catch (err) {
        console.warn("[InitialRead] Failed:", err);
      }
    })();

    // --- Subscribe for continuous updates ---
    const sub = device.monitorCharacteristicForService(
      PHYSICAL_ACTIVITY_SERVICE,
      STEP_COUNTER,
      (err, characteristic: Characteristic | null) => {
        if (err) {
          console.warn("[Monitor] Could not monitor StepsActivity:", err);
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
          parsePhysicalActivity,
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

  return physicalActivityData;
}
