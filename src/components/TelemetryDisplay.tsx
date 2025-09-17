import React from 'react';
import { Device } from '../core/Device';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';

interface TelemetryDisplayProps {
    device: Device;
}

export const TelemetryDisplay: React.FC<TelemetryDisplayProps> = ({ device }) => {
    const { telemetry, isConnected, error } = useLiveTelemetry(device);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', width: '400px' }}>
            <h1>Scadable Stream</h1>

            {/* Connection Status */}
            <div style={{ marginBottom: '20px' }}>
                <p>
                    Status: <span style={{
                    color: isConnected ? 'green' : 'red',
                    fontWeight: 'bold'
                }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    marginBottom: '20px',
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '4px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Telemetry Data Display */}
            <div>
                <h2>Telemetry Data</h2>

                <p>
                    Temperature:{" "}
                    <span style={{ fontWeight: 'bold' }}>
            {telemetry && typeof telemetry === 'object' && 'temperature' in telemetry
                ? `${telemetry.temperature}°C`
                : '--'}
          </span>
                </p>

                <div style={{
                    marginTop: '20px',
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                }}>
                    <strong>Raw Data:</strong>
                    <pre style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap' }}>
            {telemetry ? JSON.stringify(telemetry, null, 2) : 'No data received'}
          </pre>
                </div>
            </div>
        </div>
    );
};