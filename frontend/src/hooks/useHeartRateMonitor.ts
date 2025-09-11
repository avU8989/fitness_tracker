import { useEffect, useState } from "react";
import { Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { useBleDevice } from "../context/BleContext";

const HEARTRATE_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
const HEARTRATE_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";

//read heartrate measurement decoding
//Bluetooth SIG specifications are official standards
/*devices that claims to implement Heart Rate Service must follow spec: 
same flag struc, 
same endianness, 
same meaning for bytes, 
so devices from different brands can communicate seamlessly as long as they support the same service
 */
function parseHeartRateMeasurement(base64Value: string): number | null {
  //decode base64 --> bytes
  const bytes = Buffer.from(base64Value, "base64");

  if (bytes.length < 2) {
    console.error("Heartrate measuremnt invalid");
    return null;
  }

  const flags = bytes[0];
  const hr16bit = (flags & 0x01) === 0x01; // check if HR value is 16-bit

  if (!hr16bit) {
    //8 bit value
    if (bytes.length >= 2) {
      return bytes[1];
    } else {
      return null;
    }
  } else {
    //16 bit value
    if (bytes.length >= 3) {
      return bytes[1] | (bytes[2] << 8);
    } else {
      return null;
    }
  }
}

export function useHeartRateMonitor() {
  const { device } = useBleDevice();
  const [bpm, setBpm] = useState<number | null>(null);
  let lastUpdate = 0;
  useEffect(() => {
    const sub = device?.monitorCharacteristicForService(
      HEARTRATE_SERVICE,
      HEARTRATE_MEASUREMENT,
      (err, characteristic: Characteristic | null) => {
        if (err) {
          console.log("Could not monitor heartrate: ", err);
        }

        const now = Date.now();
        if (now - lastUpdate < 1000) return;
        lastUpdate = now;

        if (characteristic?.value) {
          const heartMeasurement = parseHeartRateMeasurement(
            characteristic.value
          );

          if (heartMeasurement != null) {
            setBpm(heartMeasurement);
          }
        }
      }
    );

    return () => {
      console.log("[Hook] Cleaning up subscription for Heart Rate Monitor");
      sub?.remove();
    };
  }, [device]);

  return bpm;
}
