/*
Record of BLE bond or pairing, storing securely
Represent metadata of paired device
Should not store raw keys directly
*/

export interface BondRecord {
    //can be MAC or Device Name
    //but MAC and Device Name check would not be sufficient as the attacker can spoof both values through an easy bluetoothctl scan / or nrf connect app
    deviceId: string;
    deviceName: string;

    //later for attack BLESA used to recognize bonded device when it uses a Resolvable private addresses (RPAs)
    authToken?: string;

    //timestamp when bond was created used for logging
    rssi: number,

    //device serial number (only encrypted)
    deviceSerial?: string;

    //SHA256 of device public key for challenge response
    pubkeyFingerPrint?: string;

    createdAt: number;
}

//shows the current app mitigation mode --> controlled by environment variables in the config
export type MITIGATION_MODE = "NONE" | "A1_ATTACK2_MITIGATION" | "A1_BLESA_FALLBACK"

//Enum of outcomes used for logs
export enum ConnectionDecision {
    BONDED_MATCH = "bonded_match",
    MISMATCH_SKIPPED = "mismatch_skipped",
    FALLBACK_NAME_UUID = "fallback_name_uuid",
    NO_BOND_FAIL_CLOSED = "no_bond_fail_closed"
}

//outcome of post connection validation --> used in logs
export enum EncryptionCheck {
    ENCRYPTED = "encrypted",
    NOT_ENCRYPTED = "not_encrypted",
    UNKNOWN = "unknown",
}

