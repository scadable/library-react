/**
 * Scadable Health - Medical telemetry visualization components
 *
 * ECG and EEG chart components for real-time health data visualization
 * Import via: import { ECGChart, EEGChart } from 'scadable/health'
 */

// Re-export core dependencies
export { Facility } from './core/Facility';
export { Device } from './core/Device';
export { useLiveTelemetry } from './hooks/useLiveTelemetry';

// Health components (will be added as they're created)
export { ECGChart } from './components/ECGChart';
export type { ECGChartProps } from './components/ECGChart';

export { EEGChart } from './components/EEGChart';
export type { EEGChartProps, EEGChannelConfig } from './components/EEGChart';

// Health-specific hooks (will be added as they're created)
export { useECGAnalysis } from './hooks/useECGAnalysis';
export { useEEGSpectralAnalysis } from './hooks/useEEGSpectralAnalysis';

// Re-export core types
export type {
  TelemetryData,
  ScadablePayload,
  WebSocketMessage,
  WebSocketConfig,
  TelemetryHookResult,
} from './core/types';
export { ConnectionStatus } from './core/types';
export type { ConnectionStatusValue } from './core/types';
