import type { TelemetryData } from '../core/types';

/**
 * Parses a WebSocket message payload into telemetry data.
 * If the payload is valid JSON, returns the parsed object; otherwise returns the raw string.
 */
export function parseMessage(payload: string): TelemetryData | string {
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}


