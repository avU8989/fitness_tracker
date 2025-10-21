// BleProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";

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
const TARGET_SERVICES = [HR_SERVICE, PLX_SERVICE, SLEEP_SERVICE];

async function requestBlePermission() {
    if (Platform.OS !== "android") return;
    const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
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
            // manager.destroy(); // only if you tear down the whole app
        };
    }, [filterMode]);

    function safeStopScan() {
        if (scanningRef.current) {
            manager.stopDeviceScan();
            scanningRef.current = false;
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
        } catch (e) {
            // Handles "Cannot start scanning operation"
            console.log("startDeviceScan threw, retrying shortly:", e);
            scanningRef.current = false;
            setTimeout(startScan, 600);
        }
    }

    const onScan = async (error: any, d?: Device | null) => {
        if (error) {
            console.log("Scan error:", error);
            // Typical cause: overlapping scans → stop & retry
            safeStopScan();
            setTimeout(startScan, 600);
            return;
        }
        if (!d || connectingRef.current) return;

        console.log("Discovered:", d.name, d.id, d.serviceUUIDs);

        const name = (d.name ?? "").toLowerCase();
        const hasHr = (d.serviceUUIDs ?? []).some(u => u?.toLowerCase() === HR_SERVICE);
        const hasPlx = (d.serviceUUIDs ?? []).some(u => u?.toLowerCase() === PLX_SERVICE);
        const hasSleep = (d.serviceUUIDs ?? []).some(u => u?.toLowerCase() === SLEEP_SERVICE);


        let match = false;
        switch (filterMode) {
            case "NAME_ONLY":
                match = name.includes(TARGET_NAME.toLowerCase());
                break;
            case "SERVICE":
                // If serviceFilter was set, OS already filtered; still fine to double-check:
                match = hasHr || hasPlx;
                break;
            case "BOTH":
                match = name.includes(TARGET_NAME) && (hasHr || hasPlx);
                break;
        }

        if (!match) return;

        safeStopScan();
        await connectAndDiscover(d);
    };

    async function connectAndDiscover(d: Device) {
        if (connectingRef.current) return;
        connectingRef.current = true;

        try {
            const connected = await d.connect(); // you can pass { requestMTU: 185 } if you need bigger MTU
            // Small settle delay helps certain stacks
            console.log("Connected to: ", d.name, d.id)
            await delay(1000);
            await connected.discoverAllServicesAndCharacteristics();

            // DO NOT call servicesForDevice before discoverAll... completes
            await delay(1000);
            const services = await manager.servicesForDevice(connected.id);
            console.log("Discovered services:", services.map(s => s.uuid));

            if (!services.length) {
                // Likely GATT cache or timing—disconnect and retry once
                await connected.cancelConnection();
                await delay(400);
                throw new Error("No services discovered (possible GATT cache).");
            }

            if (!isMountedRef.current) return;
            setDevice(connected);

            // Optional: set up monitors here, not before.
            // e.g., monitor HR only if present:
            const uuids = services.map(s => s.uuid.toLowerCase());
            if (!uuids.includes(HR_SERVICE) && !uuids.includes(PLX_SERVICE)) {
                console.log("Target services not present on GATT.");
            }
        } catch (e) {
            console.error("Connection failed:", e);
            // Backoff then resume scanning
            await delay(600);
            if (isMountedRef.current) startScan();
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

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}


export function useBleDevice() {
    const ctx = useContext(BleContext);
    if (!ctx) throw new Error("useBleDevice must be used inside BleProvider");
    return ctx;
}
