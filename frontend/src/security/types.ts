/*
Record of BLE bond or pairing, storing securely
Represent metadata of paired device
Should not store raw keys directly
*/

export interface BondRecord {
    deviceId: string; // MAC Address can be the static real mac address or pricate resolvable addresse (RPA)
    deviceName: string;

    //SHA256 of device public key for challenge response
    pubkeyFingerPrint?: string;
    rssi?: number;
    createdAt: number;
}
