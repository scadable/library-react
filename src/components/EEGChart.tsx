/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { Facility } from '../core/Facility';
import { Device } from '../core/Device';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';
import { getValueByPath } from '../utils/jsonPath';
import { EEGRenderer, EEGRendererConfig } from '../utils/eegRenderer';
import { useEEGSpectralAnalysis } from '../hooks/useEEGSpectralAnalysis';
import { EEG } from '../utils/medicalConstants';

export interface EEGChannelConfig {
  /** Channel name (e.g., "Fp1", "Fp2") */
  name: string;
  /** JSON path to extract channel value (e.g., ".data.channels.Fp1") */
  dataPath: string;
  /** Channel color */
  color: string;
}

export interface EEGChartProps {
  /** API key for authentication (required if device not provided) */
  apiKey?: string;
  /** Device ID to connect to (required if device not provided) */
  deviceId?: string;
  /** Pre-configured Device instance (alternative to apiKey/deviceId) */
  device?: Device;
  /** Chart title */
  title?: string;
  /** Channel configurations */
  channels: EEGChannelConfig[];
  /** Display mode: realtime or historical */
  mode?: 'realtime' | 'historical';
  /** Historical data map (channelName -> values array) */
  historicalData?: Map<string, number[]>;
  /** Sensitivity in µV/mm (default: 70) */
  sensitivity?: number;
  /** Time window in seconds (default: 10) */
  timeWindow?: number;
  /** Sampling rate in Hz (default: 256) */
  samplingRate?: number;
  /** Layout mode: stacked or overlay (default: stacked) */
  layout?: 'stacked' | 'overlay';
  /** Show channel labels (default: true) */
  showLabels?: boolean;
  /** Show spectral analysis panel (default: false) */
  showSpectralAnalysis?: boolean;
  /** Frequency bands to analyze (default: all) */
  frequencyBands?: Array<'delta' | 'theta' | 'alpha' | 'beta' | 'gamma'>;
  /** Background color */
  backgroundColor?: string;
  /** Grid color */
  gridColor?: string;
  /** Text color */
  textColor?: string;
  /** Chart width (default: 1000) */
  width?: number;
  /** Chart height (default: 600) */
  height?: number;
}

export const EEGChart: React.FC<EEGChartProps> = ({
  apiKey,
  deviceId,
  device: providedDevice,
  title = 'EEG Monitor',
  channels,
  mode = 'realtime',
  historicalData,
  sensitivity = EEG.DEFAULT_SENSITIVITY,
  timeWindow = EEG.DEFAULT_TIME_WINDOW,
  samplingRate = EEG.DEFAULT_SAMPLING_RATE,
  layout = 'stacked',
  showLabels = true,
  showSpectralAnalysis = false,
  frequencyBands = ['delta', 'theta', 'alpha', 'beta', 'gamma'],
  backgroundColor = EEG.COLORS.BACKGROUND,
  gridColor = EEG.COLORS.GRID,
  textColor = EEG.COLORS.TEXT,
  width = 1000,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<EEGRenderer | null>(null);
  const channelBuffersRef = useRef<Map<string, Float32Array>>(new Map());

  // Use provided device or create one from apiKey/deviceId (only for realtime mode)
  const device = useState(() => {
    if (mode === 'historical') {
      return null;
    }
    if (providedDevice) {
      return providedDevice;
    }
    if (!apiKey || !deviceId) {
      throw new Error('Either provide a device instance or both apiKey and deviceId for realtime mode');
    }
    const facility = new Facility(apiKey);
    return new Device(facility, deviceId);
  })[0];

  const { telemetry, isConnected, error } = useLiveTelemetry(device || undefined);

  // Spectral analysis
  const spectralData = useEEGSpectralAnalysis(
    showSpectralAnalysis ? channelBuffersRef.current : null,
    {
      samplingRate,
      enabled: showSpectralAnalysis && mode === 'realtime',
    }
  );

  // Initialize renderer and buffers
  useEffect(() => {
    if (!canvasRef.current) return;

    const config: EEGRendererConfig = {
      width,
      height,
      sensitivity,
      timeWindow,
      samplingRate,
      layout,
      showLabels,
      backgroundColor,
      gridColor,
      textColor,
    };

    rendererRef.current = new EEGRenderer(canvasRef.current, config);

    // Initialize channels
    channels.forEach(channel => {
      rendererRef.current?.addChannel(channel.name, channel.color);

      // Create buffer for this channel
      const bufferSize = Math.ceil(timeWindow * samplingRate);
      channelBuffersRef.current.set(channel.name, new Float32Array(bufferSize));
    });

    // Start animation loop
    rendererRef.current.startAnimation();

    // Cleanup
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [channels, width, height, sensitivity, timeWindow, samplingRate, layout, showLabels, backgroundColor, gridColor, textColor]);

  // Handle realtime telemetry data
  useEffect(() => {
    if (mode !== 'realtime' || !telemetry || typeof telemetry !== 'object') return;
    if (!rendererRef.current) return;

    channels.forEach(channel => {
      const value = getValueByPath(telemetry, channel.dataPath);
      if (value !== undefined) {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          rendererRef.current?.addDataPoint(channel.name, numericValue);

          // Also update our buffer for spectral analysis
          const buffer = channelBuffersRef.current.get(channel.name);
          if (buffer) {
            // Shift buffer and add new value
            for (let i = 0; i < buffer.length - 1; i++) {
              buffer[i] = buffer[i + 1];
            }
            buffer[buffer.length - 1] = numericValue;
          }
        }
      }
    });
  }, [telemetry, channels, mode]);

  // Handle historical data
  useEffect(() => {
    if (mode !== 'historical' || !historicalData || !rendererRef.current) return;

    rendererRef.current.clearBuffers();
    historicalData.forEach((values, channelName) => {
      rendererRef.current?.addDataPoints(channelName, values);
    });
  }, [historicalData, mode]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'transparent' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {channels.length} channel{channels.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Canvas Container */}
        <div style={{ flex: showSpectralAnalysis ? '1' : 'none' }}>
          <div style={{ position: 'relative', width, height, border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Connection Status - Only show in realtime mode */}
            {mode === 'realtime' && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '20px',
                  border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#22c55e' : '#ef4444',
                    animation: isConnected ? 'pulse 2s infinite' : 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isConnected ? '#22c55e' : '#ef4444',
                  }}
                >
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
            )}

            {/* Canvas */}
            <canvas ref={canvasRef} />
          </div>

          {/* Chart Info */}
          <div style={{ marginTop: '10px', color: '#666', fontSize: '14px', display: 'flex', gap: '20px' }}>
            <span>Sensitivity: {sensitivity} µV/mm</span>
            <span>Window: {timeWindow}s</span>
            <span>Rate: {samplingRate} Hz</span>
            <span>Layout: {layout}</span>
          </div>
        </div>

        {/* Spectral Analysis Panel */}
        {showSpectralAnalysis && (
          <div style={{ width: '300px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>Spectral Analysis</h3>
            {spectralData.size > 0 ? (
              Array.from(spectralData.entries()).map(([channelName, data]) => {
                const channel = channels.find(c => c.name === channelName);
                return (
                  <div key={channelName} style={{ marginBottom: '20px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: channel?.color }}>
                      {channelName}
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
                      {frequencyBands.includes('delta') && (
                        <div>δ Delta: {data.bands.delta.toFixed(2)}</div>
                      )}
                      {frequencyBands.includes('theta') && (
                        <div>θ Theta: {data.bands.theta.toFixed(2)}</div>
                      )}
                      {frequencyBands.includes('alpha') && (
                        <div>α Alpha: {data.bands.alpha.toFixed(2)}</div>
                      )}
                      {frequencyBands.includes('beta') && (
                        <div>β Beta: {data.bands.beta.toFixed(2)}</div>
                      )}
                      {frequencyBands.includes('gamma') && (
                        <div>γ Gamma: {data.bands.gamma.toFixed(2)}</div>
                      )}
                      <div style={{ marginTop: '4px', fontWeight: 'bold' }}>
                        Dominant: {data.dominantBand}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#666', fontSize: '14px' }}>Analyzing...</div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
