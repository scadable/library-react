import type { TelemetryData, ScadablePayload } from '../core/types';

/**
 * Parses a WebSocket message payload into telemetry data.
 * Returns the full Scadable payload structure including metadata and data.
 * If the payload is valid JSON, returns the parsed object; otherwise returns the raw string.
 */
export function parseMessage(payload: string): TelemetryData | string {
  try {
    return JSON.parse(payload) as ScadablePayload;
  } catch {
    return payload;
  }
}
