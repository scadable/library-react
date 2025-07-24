// File: src/contexts/ScadableDeviceIDContext.tsx

import React, { createContext, useContext, ReactNode, useState } from "react";

/**
 * Shape of the Device‑ID context: current ID + setter.
 */
interface DeviceIDContextType {
    deviceID: string;
    setDeviceID: (id: string) => void;
}

const ScadableDeviceIDContext = createContext<DeviceIDContextType | undefined>(undefined);

/**
 * Wrap your tree in this provider to make deviceID available everywhere.
 */
export const ScadableDeviceIDProvider = ({
                                             initialDeviceID,
                                             children,
                                         }: {
    /** Bootstrapped value (e.g. from router or last‑used) */
    initialDeviceID: string;
    children: ReactNode;
}) => {

    const [deviceID, setDeviceID] = useState(initialDeviceID);

    return (
        <ScadableDeviceIDContext.Provider value={{ deviceID, setDeviceID }}>
            {children}
        </ScadableDeviceIDContext.Provider>
    );
};

/**
 * Hook to consume deviceID + setter.
 * Throws if used outside the provider.
 */
export const useScadableDeviceID = (): DeviceIDContextType => {
    const ctx = useContext(ScadableDeviceIDContext);
    if (!ctx) {
        throw new Error("useScadableDeviceID must be used within a ScadableDeviceIDProvider");
    }
    return ctx;
};
