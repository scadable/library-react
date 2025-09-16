/**
 * Scadable Stream - Real-time telemetry data for React applications
 *
 * Public entry point: re-export core, hooks, and types
 */

// Core
export { Facility } from './core/Facility';
export { Device } from './core/Device';

// Hooks
export { useLiveTelemetry } from './hooks';

// Types
export type {
  TelemetryData,
  WebSocketMessage,
  WebSocketConfig,
  TelemetryHookResult,
} from './core/types';
export { ConnectionStatus } from './core/types';
export type { ConnectionStatusValue } from './core/types';
