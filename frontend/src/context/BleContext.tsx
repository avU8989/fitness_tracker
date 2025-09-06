// context/BleContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

export type FilterMode = "NAME_ONLY" | "SERVICE" | "BOTH";

interface BleContextType {
    device: Device | null;
    manager: BleManager;
    filterMode: FilterMode;
    setFilterMode: (m: FilterMode) => void;
}

const BleContext = createContext<BleContextType | undefined>(undefined);
const manager = new BleManager();

const TARGET_NAME = "yourwatch";
const HR_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";

async function requestBlePermission() {
    if (Platform.OS !== "android") return;
    await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
}

export function BleProvider({ children }: { children: React.ReactNode }) {
    const [device, setDevice] = useState<Device | null>(null);
    const [filterMode, setFilterMode] = useState<FilterMode>("SERVICE");
    const connectingRef = useRef(false);

    useEffect(() => {
        let isMounted = true;
        requestBlePermission();

        const stateSub = manager.onStateChange((state) => {
            if (state !== "PoweredOn") return;

            // fresh scan each time filter changes
            manager.stopDeviceScan();
            connectingRef.current = false;

            manager.startDeviceScan(null, null, async (error, d) => {
                if (error) { console.error("Scan error:", error); return; }
                if (!d || connectingRef.current) return;

                const name = d.name?.toLowerCase() ?? "";
                const hasHrService = d.serviceUUIDs?.includes(HR_SERVICE) ?? false;

                let match = false;
                switch (filterMode) {
                    case "NAME_ONLY":
                        match = name.includes(TARGET_NAME);
                        break;
                    case "SERVICE":
                        match = hasHrService;
                        break;
                    case "BOTH":
                        match = name.includes(TARGET_NAME) && hasHrService;
                        break;
                }

                if (match) {
                    connectingRef.current = true;
                    manager.stopDeviceScan();
                    try {
                        const connected = await d.connect();
                        await connected.discoverAllServicesAndCharacteristics();
                        if (isMounted) setDevice(connected);
                        console.log("Connected:", connected.id, connected.name);
                    } catch (e) {
                        console.error("Connection failed:", e);
                        connectingRef.current = false;
                        // optionally restart scan:
                        manager.startDeviceScan(null, null, () => { });
                    }
                }
            });
        }, true);

        return () => {
            isMounted = false;
            stateSub.remove();
            manager.stopDeviceScan();
            // don't destroy the manager unless you truly unmount the whole app tree
            // manager.destroy();
        };
    }, [filterMode]);

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
