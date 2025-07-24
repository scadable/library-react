// File: src/hooks/useLiveQuery.ts

import { useState, useEffect, useRef } from "react";
import { LiveQueryService, DataPoint } from "../services/LiveQueryService";
import { useScadableAPIKey } from "../contexts/ScadableAPIKeyContext";
import { useScadableDeviceID } from "../contexts/ScadableDeviceIDContext";

/**
 * Custom React hook to subscribe to live telemetry.
 *
 * @param bufferSize  Maximum number of points to keep (oldest dropped)
 * @returns           Array of most recent DataPoints, newest first
 */
export function useLiveQuery(bufferSize: number = 60): DataPoint[] {

    const { apiKey } = useScadableAPIKey();
    const { deviceID } = useScadableDeviceID();

    const [data, setData] = useState<DataPoint[]>([]);
    const svcRef = useRef<LiveQueryService | null>(null);

    useEffect(() => {
        // Don't try to connect if we lack credentials
        if (!deviceID.trim()) {
            setData([]);
            return;
        }

        // Instantiate the service with current key + ID
        const svc = new LiveQueryService(apiKey, deviceID);
        svcRef.current = svc;

        // Start subscription
        svc.subscribeToLiveQuery(
            (dp) => {
                setData((prev) => {
                    const next = [dp, ...prev];
                    return next.length > bufferSize ? next.slice(0, bufferSize) : next;
                });
            },
            (err) => {
                console.error("LiveQueryService error:", err);
            }
        );

        // Cleanup on unmount or when deps change
        return () => {
            svc.unsubscribe();
            svcRef.current = null;
        };
    }, [apiKey, deviceID, bufferSize]);

    return data;
}
