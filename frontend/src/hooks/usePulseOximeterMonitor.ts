import { useEffect, useState } from "react";
import { BleManager, Characteristic, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { useBleDevice } from "../context/BleContext";

const PLX_SERVICE = "00001822-0000-1000-8000-00805f9b34fb";
const PLX_CONT_MEAS = "00002a5f-0000-1000-8000-00805f9b34fb"; // Continuous

function b64ToBytes(b64: string) {
  return Buffer.from(b64, "base64");
}

// IEEE-11073 16-bit SFLOAT (little-endian)
function sfloat16(lo: number, hi: number): number | null {
  const raw = (hi << 8) | lo;
  // mantissa: 12-bit signed, exponent: 4-bit signed (10^exp)
  let mant = raw & 0x0fff;
  if (mant & 0x0800) mant -= 0x1000;
  let exp = (raw >> 12) & 0x0f;
  if (exp & 0x8) exp -= 0x10;
  // optional: handle reserved/NaN codes (0x07FF etc.)
  return mant * Math.pow(10, exp);
}

// Works for both 0x2A5F and 0x2A5E typical layouts:
// [Flags][SpO2 SFLOAT][PulseRate SFLOAT]...
function parsePlx(
  base64: string
): { spo2: number | null; pulseRate: number | null } | null {
  const d = b64ToBytes(base64);
  if (d.length < 5) return null;
  let i = 0;

  const flags = d[i++]; // <-- skip flags
  const spo2 = sfloat16(d[i++], d[i++]); // SpO2 in %
  const pulseRate = sfloat16(d[i++], d[i++]); // BPM

  return { spo2, pulseRate };
}

export function usePulseOximeterMonitor() {
  const { device } = useBleDevice();
  const [spo2, setSpo2] = useState<number | null>(null);
  const [pulseRate, setPulseRate] = useState<number | null>(null);

  useEffect(() => {
    if (!device) return;
    console.log(spo2);

    let lastUpdate = 0;
    const sub = device.monitorCharacteristicForService(
      PLX_SERVICE,
      PLX_CONT_MEAS,
      (err, characteristic) => {
        if (err) return console.warn("PLX error", err);
        if (!characteristic?.value) return;

        const now = Date.now();
        if (now - lastUpdate < 2000) return; // only update every 1s
        lastUpdate = now;

        const parsed = parsePlx(characteristic.value);
        if (parsed) {
          setSpo2(parsed.spo2);
          setPulseRate(parsed.pulseRate);
        }
      }
    );

    return () => sub?.remove();
  }, [device]);

  return { spo2, pulseRate };
}
