/**
 * Scadable Stream - Real-time telemetry data for React applications
 *
 * Public entry point: re-export core, hooks, and types
 */

// Core
export { Facility } from './core/Facility';
export { Device } from './core/Device';

// Hooks
export { useLiveTelemetry } from './hooks/useLiveTelemetry';

// Components
export { LiveTelemetryLineChart } from './components/LiveTelemetryLineChart';
export type { LiveTelemetryLineChartProps } from './components/LiveTelemetryLineChart';

// Types
export type {
  TelemetryData,
  ScadablePayload,
  WebSocketMessage,
  WebSocketConfig,
  TelemetryHookResult,
} from './core/types';
export { ConnectionStatus } from './core/types';
export type { ConnectionStatusValue } from './core/types';
