// BleProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import { delay } from "../utils/apiHelpers";
import { deleteBond, loadBond, saveBond } from "../security/bondManager";
import { BondRecord } from "../security/types";
import { p256 } from '@noble/curves/nist.js';// ECDSA-P256 utilities
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { Buffer } from "buffer";
import { base64ToBytes, bytesToBase64 } from "../utils/bleParser";
import { randomBytes } from "../utils/securityHelpers";

export type FilterMode = "NAME_ONLY" | "SERVICE" | "BOTH";

interface BleContextType {
    device: Device | null;
    manager: BleManager;
    filterMode: FilterMode;
    setFilterMode: (m: FilterMode) => void;
}

const BleContext = createContext<BleContextType | undefined>(undefined);
const manager = new BleManager();
const TARGET_NAME = "FitTrack";
const HR_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
const PLX_SERVICE = "00001822-0000-1000-8000-00805f9b34fb";
const SLEEP_SERVICE = "00001111-0000-1000-8000-00805f9b34fb";
const CHALLENGE_CHAR = "0000c001-0000-1000-8000-00805f9b34fb";
const SECURE_SERVICE = "0000c000-0000-1000-8000-00805f9b34fb";
const SIGN_CHAR = "0000c002-0000-1000-8000-00805f9b34fb";
const PUBLIC_KEY_CHAR = "0000c003-0000-1000-8000-00805f9b34fb";
const TARGET_SERVICES = [HR_SERVICE, PLX_SERVICE, SLEEP_SERVICE];

async function requestBlePermission() {
    if (Platform.OS !== "android") return;
    await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    ]);
}

export function BleProvider({ children }: { children: React.ReactNode }) {
    const [device, setDevice] = useState<Device | null>(null);
    const [filterMode, setFilterMode] = useState<FilterMode>("NAME_ONLY");
    // guards
    const scanningRef = useRef(false);
    const connectingRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        requestBlePermission();

        const sub = manager.onStateChange((state) => {
            if (state === State.PoweredOn) {
                startScan();
            } else {
                // stop everything if BT not ready
                safeStopScan();
            }
        }, true);

        return () => {
            isMountedRef.current = false;
            sub.remove();
            safeStopScan();
        };
    }, [filterMode]);

    function safeStopScan() {
        if (scanningRef.current) {
            manager.stopDeviceScan();
            scanningRef.current = false;
        }
    }

    async function safeReconnectRescan(delaysMs = 800) {
        try {
            safeStopScan();
            await delay(delaysMs);
            if (isMountedRef.current) {
                console.log("[BLE] Restarting scan...");
                startScan();
            }
        } catch (err) {
            console.warn("[BLE] Failed to restart scan:", err);
        }
    }

    function startScan() {
        if (scanningRef.current || connectingRef.current) return;

        safeStopScan();

        const serviceFilter =
            filterMode === "SERVICE" || filterMode === "BOTH" ? TARGET_SERVICES : null;

        try {
            scanningRef.current = true;
            manager.startDeviceScan(serviceFilter, null, onScan);
            console.log("[BLE] Scanning...");
        } catch (e) {
            console.log("startDeviceScan threw, retrying shortly:", e);
            scanningRef.current = false;
            setTimeout(startScan, 600);
        }
    }


    // The standard(ANSI X9.62, SEC1 §2.3.3) defines encoded point formats, so a decoder can tell whether the key is compressed or not
    // 0x04 + X-Coordinate(32 Bytes) + Y-Coordinate(32 Bytes)
    // we have an Elliptic Curve Public Key
    function derToRawP256(der: Uint8Array): Uint8Array {
        //prevent to parse malicious or malformed DER
        //we are estimating that the DER-encoded SPKI ECDSA-P256 will be around 90-100 bytes
        //upon debugging our real secure ble peripheral the der length will be at around 91 bytes, but different the SPKI can vary because of (curve algorithm, encoder, firmware library or even ASN-1)
        //so we will check upon a range
        if (der.length < 70 || der.length > 120) {
            throw new Error("DER length suspicious");
        }

        //find the start of uncompressed point
        //supposed der has length of 91 and i(the correct 0x04 for the EC point) = 26 --> 91-26 = 65 
        //https://stackoverflow.com/questions/6665353/is-there-a-standardized-fixed-length-encoding-for-ec-public-keys

        const idx = der.findIndex((b, i) => der[i] === 0x04 && der.length - i >= 65)

        if (idx < 0) {
            throw new Error("Invalid DER: no 0x04 uncompressed format found");
        }

        //slice the array starting at 0x04 so we extract exactly the 65 bytes
        return der.slice(idx, idx + 65);

    }

    async function verifyPeripheralIdentity(device: Device) {
        //read device pub key (DER format, encrypted link required)
        const t0 = Date.now();

        const pubDERResponse = await device.readCharacteristicForService(SECURE_SERVICE, PUBLIC_KEY_CHAR);

        if (!pubDERResponse.value) {
            console.error("Could not read public key from peripheral");
            return { status: false };

        }

        const pubKey = base64ToBytes(pubDERResponse.value);
        console.log(`[SEC] Public key DER (hex preview): ${Buffer.from(pubKey).toString("hex").slice(0, 60)}...`);

        //convert DER --> raw uncompressed 65 byte key 
        //because noble curves has not an interpreter for uncrompressed formats
        const formattedDER = derToRawP256(pubKey);

        //now we want to write a challenge to peripheral
        //generate random challenge in bytes
        const challenge = await randomBytes(16);
        const formattedChallengeToBas64 = bytesToBase64(challenge);
        console.log(`[SEC] Challenge (hex): ${Buffer.from(formattedChallengeToBas64).toString("hex")}`);

        //write the challenge to the peripheral
        await device.writeCharacteristicWithResponseForService(SECURE_SERVICE, CHALLENGE_CHAR, formattedChallengeToBas64);

        await delay(100);

        //read the SIGN Characteristic to obtain the latest signature 
        const signChar = await device.readCharacteristicForService(SECURE_SERVICE, SIGN_CHAR);

        if (!signChar.value) {
            console.error("Could not verify peripheral identity")
            return { status: false };

        }
        const signBytes = base64ToBytes(signChar.value);
        console.log(`[SEC] Received signature (hex): ${Buffer.from(signBytes).toString("hex")}`);

        //verify
        //ps256 verify already hashes the message with SHA256
        //https://github.com/paulmillr/noble-curves/releases
        //initally had a problem because i did not normalize the s in my peripheral, but noble curves .verify method expects atleast the s to be normalized
        //we could also turn it off but i decided to keep it on, because https://www.nature.com/articles/s41598-025-05601-0
        const status = p256.verify(signBytes, challenge, formattedDER, {
            prehash: true,
        });

        if (!status) {
            console.warn("❌ Signature invalid.");
            return { status: false };

        }

        const fingerprint = bytesToHex(sha256(formattedDER));
        console.log(`[SEC] Public key fingerprint: ${fingerprint}`);


        return { status: true, fingerprint };
    }


    const onScan = async (error: any, d?: Device | null) => {


        if (error) {
            console.log("Scan error:", error);
            safeStopScan();
            setTimeout(startScan, 600);
            return;
        }

        if (!d || connectingRef.current) return;

        console.log("Discovered:", d.name, d.id, d.serviceUUIDs);

        const name = (d.name ?? "").toLowerCase();

        if (!name.includes(TARGET_NAME.toLowerCase())) {
            return;

        const bond: BondRecord | null = await loadBond();

        // If we have a bond, and addresses match, fast path
        if (bond && bond.deviceId === d.id) {
            await connectAndDiscover(d, bond);
            return;
        }

        //TO-DO add auto connect behaviour upon same fingerprint and bonded device

        // if bond exists but deviceId differs, DON'T trust yet
        // either the peripheral is using RPA (expected) or this is a spoof
        // attempt a guarded connect and run app-level verification (challenge-response)
        if (bond && bond.deviceId !== d.id) {
            console.log("[SEC] Bond exists for", bond.deviceId, "but discovered", d.id);
            await connectAndDiscover(d, bond); // connectAndDiscover should perform auth verification and disconnect on fail
            return;
        }

        // no bond: proceed to connect, pair, and then save bond inside connectAndDiscover
        await connectAndDiscover(d);
    };

    async function connectAndDiscover(d: Device, bond?: BondRecord | null) {
        if (connectingRef.current) return;
        connectingRef.current = true;

        try {
            safeStopScan();
            console.log("[BLE] Connecting to:", d.name, d.id);
            const connected: Device = await d.connect();

            if (bond) {
                // we have a previously bonded device stored in secure Keychain.
                // android automatically encrypts bonded connections; if discover succeeds, encryption is in effect.
                console.log("[POLICY] Bonded device detected, trusting Android's secure link establishment.");

                // delay slightly to let encryption handshake finish
                await delay(800)

            } else {
                // dont overwrite an existing bond 
                await delay(1000)
            }
            console.log("[BLE] Connected!");
            await delay(1000);
            await connected.discoverAllServicesAndCharacteristics();
            console.log("[BLE] Services discovered, querying...");
            await delay(800);

            const { status, fingerprint } = await verifyPeripheralIdentity(connected);
            if (!status) {
                console.warn("[SECURITY] Peripheral identity verification FAILED");
                await connected.cancelConnection();
                await delay(800);

                // Throw so the outer catch() triggers scan retry
                //should do a rescan
                safeReconnectRescan()
                throw new Error("Peripheral identity verification failed");
            }
            if (bond) {
                if (fingerprint !== bond.pubkeyFingerPrint) {
                    console.warn("[SECURITY] Peripheral identity verification FAILED on bonded device");
                    await deleteBond();
                    await connected.cancelConnection();
                    await delay(800);

                    // Throw so the outer catch() triggers scan retry
                    //should do a rescan
                    safeReconnectRescan()
                    throw new Error("Peripheral identity verification failed");
                }
            }
            console.log("[SECURITY] Peripheral identity verified ✅");

            if (!bond) {
                const newBond = await saveBond(d, fingerprint);
                console.log("[SEC] Bond saved:", newBond);
            }

            const services = await manager.servicesForDevice(connected.id);
            console.log("[BLE] Discovered services:", services.map((s) => s.uuid));

            if (!services.length) {
                console.warn("[BLE] No services found, retrying...");
                await connected.cancelConnection();
                await delay(600);
                throw new Error("No services discovered (possible GATT cache)");
            }

            if (isMountedRef.current) setDevice(connected);
        } catch (e) {
            console.error("[BLE] Connection failed:", e);
            safeReconnectRescan()

        } finally {
            connectingRef.current = false;
        }
    }

    return (
        <BleContext.Provider value={{ device, manager, filterMode, setFilterMode }}>
            {children}
        </BleContext.Provider>
    );
}

export function useBleDevice() {
    const ctx = useContext(BleContext);
    if (!ctx) throw new Error("useBleDevice must be used inside BleProvider");
    return ctx;
}
