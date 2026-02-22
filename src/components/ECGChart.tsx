/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { Facility } from '../core/Facility';
import { Device } from '../core/Device';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';
import { getValueByPath } from '../utils/jsonPath';
import { ECGRenderer, ECGRendererConfig } from '../utils/ecgRenderer';
import { useECGAnalysis } from '../hooks/useECGAnalysis';
import { ECG } from '../utils/medicalConstants';

export interface ECGChartProps {
  /** API key for authentication (required if device not provided) */
  apiKey?: string;
  /** Device ID to connect to (required if device not provided) */
  deviceId?: string;
  /** Pre-configured Device instance (alternative to apiKey/deviceId) */
  device?: Device;
  /** Chart title */
  title?: string;
  /** JSON path to extract ECG value (e.g., ".data.ecg") */
  dataPath: string;
  /** Display mode: realtime or historical */
  mode?: 'realtime' | 'historical';
  /** Historical data array (only used in historical mode) */
  historicalData?: number[];
  /** Sweep speed in mm/s (default: 25) */
  sweepSpeed?: 25 | 50;
  /** Gain in mm/mV (default: 10) */
  gain?: 5 | 10 | 20;
  /** Sampling rate in Hz (default: 250) */
  samplingRate?: number;
  /** Show ECG grid (default: true) */
  showGrid?: boolean;
  /** Show calibration pulse (default: true) */
  showCalibration?: boolean;
  /** Show heart rate display (default: true) */
  showHeartRate?: boolean;
  /** Callback when heart rate changes */
  onHeartRateChange?: (_bpm: number) => void;
  /** Waveform color (default: ECG.COLORS.WAVEFORM) */
  waveformColor?: string;
  /** Grid color (default: ECG.COLORS.GRID_MAJOR) */
  gridColor?: string;
  /** Background color (default: ECG.COLORS.BACKGROUND) */
  backgroundColor?: string;
  /** Chart width (default: 800) */
  width?: number;
  /** Chart height (default: 400) */
  height?: number;
  /** Buffer duration in seconds (default: 10) */
  bufferDuration?: number;
}

export const ECGChart: React.FC<ECGChartProps> = ({
  apiKey,
  deviceId,
  device: providedDevice,
  title = 'ECG Monitor',
  dataPath,
  mode = 'realtime',
  historicalData,
  sweepSpeed = ECG.DEFAULT_SWEEP_SPEED,
  gain = ECG.DEFAULT_GAIN,
  samplingRate = ECG.DEFAULT_SAMPLING_RATE,
  showGrid = true,
  showCalibration = true,
  showHeartRate = true,
  onHeartRateChange,
  waveformColor = ECG.COLORS.WAVEFORM,
  gridColor = ECG.COLORS.GRID_MAJOR,
  backgroundColor = ECG.COLORS.BACKGROUND,
  width = 800,
  height = 400,
  bufferDuration = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ECGRenderer | null>(null);
  const dataBufferRef = useRef<Float32Array | null>(null);

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

  // ECG analysis for heart rate
  const { heartRate } = useECGAnalysis(dataBufferRef.current, {
    samplingRate,
    enabled: showHeartRate && mode === 'realtime',
  });

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const config: ECGRendererConfig = {
      width,
      height,
      sweepSpeed,
      gain,
      samplingRate,
      showGrid,
      showCalibration,
      backgroundColor,
      waveformColor,
      gridColor,
      bufferDuration,
    };

    rendererRef.current = new ECGRenderer(canvasRef.current, config);
    dataBufferRef.current = new Float32Array(Math.ceil(bufferDuration * samplingRate));

    // Start animation loop
    rendererRef.current.startAnimation();

    // Cleanup
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [width, height, sweepSpeed, gain, samplingRate, showGrid, showCalibration, backgroundColor, waveformColor, gridColor, bufferDuration]);

  // Handle realtime telemetry data
  useEffect(() => {
    if (mode !== 'realtime' || !telemetry || typeof telemetry !== 'object') return;
    if (!rendererRef.current) return;

    const value = getValueByPath(telemetry, dataPath);
    if (value !== undefined) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        rendererRef.current.addDataPoint(numericValue);
      }
    }
  }, [telemetry, dataPath, mode]);

  // Handle historical data
  useEffect(() => {
    if (mode !== 'historical' || !historicalData || !rendererRef.current) return;

    rendererRef.current.clearBuffer();
    rendererRef.current.addDataPoints(historicalData);
  }, [historicalData, mode]);

  // Handle heart rate changes
  useEffect(() => {
    if (onHeartRateChange && heartRate > 0) {
      onHeartRateChange(heartRate);
    }
  }, [heartRate, onHeartRateChange]);

  // Determine heart rate color based on range
  const getHeartRateColor = (heartRateBpm: number): string => {
    if (heartRateBpm === 0) return ECG.COLORS.TEXT;
    if (heartRateBpm < ECG.HEART_RATE.NORMAL_MIN || heartRateBpm > ECG.HEART_RATE.NORMAL_MAX) {
      return '#ef4444'; // Red for abnormal
    }
    return '#22c55e'; // Green for normal
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'transparent' }}>
      {/* Title and Heart Rate */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {showHeartRate && mode === 'realtime' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Heart Rate:</span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: getHeartRateColor(heartRate),
              }}
            >
              {heartRate > 0 ? `${heartRate} BPM` : '--'}
            </span>
          </div>
        )}
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

      {/* Canvas Container with Status */}
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
        <span>Sweep: {sweepSpeed} mm/s</span>
        <span>Gain: {gain} mm/mV</span>
        <span>Rate: {samplingRate} Hz</span>
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
