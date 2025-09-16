import { useEffect, useState, useCallback } from 'react';
import { Device } from './Device';
import { TelemetryData, ConnectionStatus } from './types';

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
  const [telemetry, setTelemetry] = useState<TelemetryData | string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle incoming telemetry messages
  const handleMessage = useCallback((data: TelemetryData | string) => {
    setTelemetry(data);
    setError(null); // Clear any previous errors on successful message
  }, []);

  // Handle connection errors
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // Handle connection status changes
  const handleStatusChange = useCallback((status: ConnectionStatus) => {
    setIsConnected(status === ConnectionStatus.CONNECTED);
    
    // Clear error when connection is established
    if (status === ConnectionStatus.CONNECTED) {
      setError(null);
    }
  }, []);

  useEffect(() => {
    if (!device) {
      setError('Device instance is required');
      return;
    }

    // Connect to the device
    device.connect();

    // Subscribe to device events
    const unsubscribeMessage = device.onMessage(handleMessage);
    const unsubscribeError = device.onError(handleError);
    const unsubscribeStatus = device.onStatusChange(handleStatusChange);

    // Set initial connection status
    setIsConnected(device.isConnected());

    // Cleanup function
    return () => {
      unsubscribeMessage();
      unsubscribeError();
      unsubscribeStatus();
      device.disconnect();
    };
  }, [device, handleMessage, handleError, handleStatusChange]);

  return {
    telemetry,
    isConnected,
    error
  };
}
