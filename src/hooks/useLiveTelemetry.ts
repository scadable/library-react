import { useEffect, useState, useCallback } from 'react';
import { Device } from '../core/Device';
import { TelemetryData, ConnectionStatus, type ConnectionStatusValue } from '../core/types';

/**
 * React hook for consuming real-time telemetry data from a Device
 *
 * @param device - The Device instance to connect to
 * @returns Object containing telemetry data, connection status, and error state
 */
export function useLiveTelemetry(device: Device): {
    telemetry: TelemetryData | string | null;
    isConnected: boolean;
    error: string | null;
} {
    const [state, setState] = useState<{
        telemetry: TelemetryData | string | null;
        isConnected: boolean;
        error: string | null;
    }>({
        telemetry: null,
        isConnected: false,
        error: null,
    });

    const handleMessage = useCallback((data: TelemetryData | string) => {
        setState(prevState => ({ ...prevState, telemetry: data, error: null }));
    }, []);

    const handleError = useCallback((errorMessage: string) => {
        setState(prevState => ({ ...prevState, error: errorMessage }));
    }, []);

    const handleStatusChange = useCallback((status: ConnectionStatusValue) => {
        setState(prevState => ({
            ...prevState,
            isConnected: status === ConnectionStatus.CONNECTED,
            error: status === ConnectionStatus.CONNECTED ? null : prevState.error,
        }));
    }, []);

    useEffect(() => {
        if (!device) {
            setState(prevState => ({ ...prevState, error: 'Device instance is required' }));
            return;
        }

        device.connect();

        const unsubscribeMessage = device.onMessage(handleMessage);
        const unsubscribeError = device.onError(handleError);
        const unsubscribeStatus = device.onStatusChange(handleStatusChange);

        setState(prevState => ({ ...prevState, isConnected: device.isConnected() }));

        return () => {
            unsubscribeMessage();
            unsubscribeError();
            unsubscribeStatus();
            device.disconnect();
        };
    }, [device, handleMessage, handleError, handleStatusChange]);

    return state;
}