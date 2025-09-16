/**
 * Scadable Stream - Real-time telemetry data for React applications
 * 
 * This library provides a simple way to consume real-time telemetry data
 * from devices through WebSocket connections in React applications.
 */

// Export main classes and hooks
export { Facility } from './Facility';
export { Device } from './Device';
export { useLiveTelemetry } from './useLiveTelemetry';

// Export types
export type {
  TelemetryData,
  WebSocketMessage,
  WebSocketConfig,
  TelemetryHookResult
} from './types';

export { ConnectionStatus } from './types';
