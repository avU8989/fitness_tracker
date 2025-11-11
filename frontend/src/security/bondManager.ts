/*
https://developer.android.com/privacy-and-security/keystore
https://oblador.github.io/react-native-keychain/docs
https://oblador.github.io/react-native-keychain/docs/usage
*/

import * as Keychain from "react-native-keychain"
import { BondRecord } from "./types";
import { Device } from "react-native-ble-plx";
/*react native keychain provides persistent data storage, it is noted that it should not be relied upon as sole source of truth for irreplacable critical data */

//load the credentials and return a bond record
export async function loadBond(): Promise<BondRecord | null> {
    try {
        console.info("[SECURITY] Loading bond.......")
        const credentials = await Keychain.getGenericPassword({ service: "com.example.bond" });

        if (!credentials) {
            console.log("[SECURITY] No bond record found in Keychain.");
            return null;
        }

        const bondRecord = JSON.parse(credentials.password);
        console.info("Bond is : ", bondRecord);
        return bondRecord;

    } catch (error) {
        return null;
    }

}

//store credentials and save the bonding metadata for handling the logic in the challenge response protocol in our final secured BLE peripheral
export async function saveBond(device: Device, pubkeyFingerPrint?: string): Promise<BondRecord | null> {
    const bondRecord: BondRecord = {
        deviceId: device.id,
        deviceName: device.name ?? "",
        pubkeyFingerPrint: pubkeyFingerPrint,
        rssi: device.rssi ?? 0,
        createdAt: Date.now(),
    };

    try {
        console.log("[SECURITY] Saving bond record:", bondRecord);

        const result = await Keychain.setGenericPassword(
            "bondKey", // username
            JSON.stringify(bondRecord), // password string
            {
                authenticationPrompt: { title: "Authenticate to manage bond" },
                accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
                accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
                service: "com.example.bond", // optional but safer
                storage: Keychain.STORAGE_TYPE.AES_GCM, // instead of AES_GCM_NoAuth
            }
        );

        console.log("[SECURITY] Keychain.setGenericPassword result:", result);
        console.log("[SEC] Bond saved OK:", bondRecord);
        return bondRecord;

    } catch (error: any) {
        console.error("[SECURITY] Failed to save bond record:", error?.message, error);
        return null;
    }
}


export async function deleteBond(): Promise<void> {
    try {
        await Keychain.resetGenericPassword({ service: "com.example.bond" });
        console.log("[SECURITY] Delete bond record");
    } catch (error) {
        console.log("[SECURITY] Failed to delete bond record: ", error);
    }
}

