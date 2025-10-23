import { parse } from "@babel/core";
import { Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";

export type Parser<T> = (base64Value: string) => T | null;

export function handleCharacteristic<T>(
  char: Characteristic | null,
  parser: Parser<T>,
  onData: (parsed: T) => void,
  source: string
) {
  if (!char?.value) {
    console.log(`[${source}] Empty characteristic value`);
    return;
  }

  try {
    console.log(`[${source}] Raw Base64:`, char.value);
    const parsed = parser(char.value);

    if (parsed) {
      console.log(`[${source}] Parsed:`, parsed);
      onData(parsed);
    } else {
      console.log(`[${source}] Parser returned null`);
    }
  } catch (e) {
    console.error(`[${source}] Failed to parse characteristic:`, e);
  }
}

// helper for parsing
export const bytesToBase64 = (b: Uint8Array) => Buffer.from(b).toString("base64")
export const base64ToBytes = (base64: string) => new Uint8Array(Buffer.from(base64, "base64"));
