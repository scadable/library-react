/**
 * Telemetry data types for the Scadable Stream library
 */

/**
 * Base telemetry data structure
 * Can contain any key-value pairs representing sensor data
 */
export interface TelemetryData {
  [key: string]: any;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  data: string;
  type?: string;
  target?: WebSocket;
}

/**
 * Configuration for WebSocket connection
 */
export interface WebSocketConfig {
  url: string;
  token: string;
  deviceId: string;
}

/**
 * Hook return type for useLiveTelemetry
 */
export interface TelemetryHookResult {
  telemetry: TelemetryData | string | null;
  isConnected: boolean;
  error: string | null;
}

/**
 * Device connection status
 */
export const ConnectionStatus = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
} as const;
export type ConnectionStatusValue = typeof ConnectionStatus[keyof typeof ConnectionStatus];
