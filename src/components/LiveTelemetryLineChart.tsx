import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Facility } from '../core/Facility';
import { Device } from '../core/Device';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';
import { getValueByPath } from '../utils/jsonPath';

export interface LiveTelemetryLineChartProps {
  /** API key for authentication (required if device not provided) */
  apiKey?: string;
  /** Device ID to connect to (required if device not provided) */
  deviceId?: string;
  /** Pre-configured Device instance (alternative to apiKey/deviceId) */
  device?: Device;
  /** Chart title */
  title: string;
  /** X-axis label */
  xAxisLabel: string;
  /** Y-axis label */
  yAxisLabel: string;
  /** JSON path to extract X-axis value (e.g., ".timestamp") */
  xDataPath: string;
  /** JSON path to extract Y-axis value (e.g., ".data.tempreture") */
  yDataPath: string;
  /** Minimum Y-axis value (required for fixed scale) */
  yMin: number;
  /** Maximum Y-axis value (required for fixed scale) */
  yMax: number;
  /** Line color (default: "#8884d8") */
  lineColor?: string;
  /** Maximum number of data points to display (default: 20) */
  maxDataPoints?: number;
  /** Chart width (default: 600) */
  width?: number;
  /** Chart height (default: 400) */
  height?: number;
}

interface ChartDataPoint {
  x: any;
  y: any;
  timestamp: number;
}

export const LiveTelemetryLineChart: React.FC<LiveTelemetryLineChartProps> = ({
  apiKey,
  deviceId,
  device: providedDevice,
  title,
  xAxisLabel,
  yAxisLabel,
  xDataPath,
  yDataPath,
  yMin,
  yMax,
  lineColor = '#8884d8',
  maxDataPoints = 20,
  width = 600,
  height = 400,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Use provided device or create one from apiKey/deviceId
  const device = useState(() => {
    if (providedDevice) {
      return providedDevice;
    }
    if (!apiKey || !deviceId) {
      throw new Error('Either provide a device instance or both apiKey and deviceId');
    }
    const facility = new Facility(apiKey);
    return new Device(facility, deviceId);
  })[0];

  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  useEffect(() => {
    if (telemetry && typeof telemetry === 'object') {
      const xValue = getValueByPath(telemetry, xDataPath);
      const yValue = getValueByPath(telemetry, yDataPath);

      if (xValue !== undefined && yValue !== undefined) {
        const numericY = parseFloat(yValue) || yValue;

        const newDataPoint: ChartDataPoint = {
          x: xValue,
          y: numericY,
          timestamp: Date.now(),
        };

        setChartData((prevData) => {
          const updatedData = [...prevData, newDataPoint];
          return updatedData.slice(-maxDataPoints);
        });
      }
    }
  }, [telemetry, xDataPath, yDataPath, maxDataPoints]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'transparent' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{title}</h2>

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

      {/* Chart Container with Status */}
      <div style={{ position: 'relative', width, height }}>
        {/* Connection Status - Top Right */}
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

        <ResponsiveContainer width={width} height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id={`colorGradient-${lineColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
          <XAxis
            dataKey="x"
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, style: { fontWeight: 600, fontSize: 14 } }}
            tickFormatter={(value) => {
              // Format timestamps as time if the value looks like an ISO string
              if (typeof value === 'string' && value.includes('T')) {
                return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              }
              return value;
            }}
            stroke="#666"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
          />
          <YAxis
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontWeight: 600, fontSize: 14 } }}
            stroke="#666"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
            domain={[yMin, yMax]}
          />
          <Tooltip
            labelFormatter={(value) => {
              if (typeof value === 'string' && value.includes('T')) {
                return new Date(value).toLocaleString();
              }
              return value;
            }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              border: `2px solid ${lineColor}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="y"
            stroke={lineColor}
            name={yAxisLabel}
            strokeWidth={3}
            dot={{ r: 5, fill: lineColor, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2 }}
            fill={`url(#colorGradient-${lineColor})`}
            isAnimationActive={false}
          />
        </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Points Counter */}
      <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
        Data points: {chartData.length} / {maxDataPoints}
      </p>

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