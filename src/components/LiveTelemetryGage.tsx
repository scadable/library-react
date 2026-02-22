import React, { useState, useEffect } from 'react';
import { Facility } from '../core/Facility';
import { Device } from '../core/Device';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';
import { getValueByPath } from '../utils/jsonPath';

export interface LiveTelemetryGageProps {
  /** API key for authentication (required if device not provided) */
  apiKey?: string;
  /** Device ID to connect to (required if device not provided) */
  deviceId?: string;
  /** Pre-configured Device instance (alternative to apiKey/deviceId) */
  device?: Device;
  /** Gage title */
  title: string;
  /** JSON path to extract value (e.g., ".data.temperature") */
  dataPath: string;
  /** Minimum range value */
  min: number;
  /** Maximum range value */
  max: number;
  /** Unit label (e.g., "°C", "PSI", "RPM") */
  unit?: string;
  /** Number of decimal places to display (default: 1) */
  decimals?: number;
  /** Gage width and height (default: 300) */
  size?: number;
  /** Primary color for high values (default: "#ef4444") */
  colorHigh?: string;
  /** Middle color for medium values (default: "#eab308") */
  colorMid?: string;
  /** Low color for low values (default: "#22c55e") */
  colorLow?: string;
}

export const LiveTelemetryGage: React.FC<LiveTelemetryGageProps> = ({
  apiKey,
  deviceId,
  device: providedDevice,
  title,
  dataPath,
  min,
  max,
  unit = '',
  decimals = 1,
  size = 300,
  colorHigh = '#ef4444',
  colorMid = '#eab308',
  colorLow = '#22c55e',
}) => {
  const [currentValue, setCurrentValue] = useState<number | null>(null);

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
      const value = getValueByPath(telemetry, dataPath);
      if (value !== undefined) {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          setCurrentValue(numericValue);
        }
      }
    }
  }, [telemetry, dataPath]);

  // Calculate percentage and angle for the gauge arc
  const percentage = currentValue !== null
    ? Math.min(Math.max((currentValue - min) / (max - min), 0), 1)
    : 0;

  const startAngle = -135; // Start at bottom-left
  const endAngle = 135; // End at bottom-right
  const angleRange = endAngle - startAngle;
  const currentAngle = startAngle + (angleRange * percentage);

  // Determine color based on percentage
  const getColor = () => {
    if (percentage < 0.33) return colorLow;
    if (percentage < 0.67) return colorMid;
    return colorHigh;
  };

  // SVG arc path calculation
  const svgHeight = size * 0.85;
  const radius = (size * 0.3);
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = size * 0.08;

  const polarToCartesian = (angle: number) => {
    const angleInRadians = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const createArc = (start: number, end: number) => {
    const startPoint = polarToCartesian(start);
    const endPoint = polarToCartesian(end);
    const largeArcFlag = end - start <= 180 ? 0 : 1;

    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
  };

  const backgroundPath = createArc(startAngle, endAngle);
  const foregroundPath = createArc(startAngle, currentAngle);

  // Format value display
  const displayValue = currentValue !== null
    ? currentValue.toFixed(decimals)
    : '--';

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'transparent',
      width: 'fit-content',
    }}>
      <h2 style={{
        marginBottom: '10px',
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 600,
        color: '#1f2937',
      }}>
        {title}
      </h2>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginBottom: '15px',
            padding: '10px 16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            fontSize: '14px',
            maxWidth: size,
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Gage Container */}
      <div style={{ position: 'relative', width: size, height: svgHeight, overflow: 'hidden' }}>
        {/* Connection Status - Top Right */}
        <div
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#22c55e' : '#ef4444',
              animation: isConnected ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isConnected ? '#22c55e' : '#ef4444',
            }}
          >
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>

        {/* SVG Gage */}
        <svg
          width={size}
          height={svgHeight}
          viewBox={`0 0 ${size} ${svgHeight}`}
          style={{ display: 'block' }}
        >
          <defs>
            {/* Clip path to ensure nothing goes outside */}
            <clipPath id={`gaugeClip-${title}`}>
              <rect x="0" y="0" width={size} height={svgHeight} />
            </clipPath>

            {/* Gradient for the arc */}
            <linearGradient id={`gageGradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorLow} stopOpacity={0.3} />
              <stop offset="50%" stopColor={colorMid} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colorHigh} stopOpacity={0.3} />
            </linearGradient>

            {/* Drop shadow */}
            <filter id="gaugeShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g clipPath={`url(#gaugeClip-${title})`}>

          {/* Background arc */}
          <path
            d={backgroundPath}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Foreground arc (value) */}
          <path
            d={foregroundPath}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              transition: 'all 0.5s ease-out',
              filter: 'url(#gaugeShadow)',
            }}
          />

          {/* Min label */}
          <text
            x={polarToCartesian(startAngle).x}
            y={Math.min(polarToCartesian(startAngle).y + 20, svgHeight - 5)}
            textAnchor="start"
            style={{
              fontSize: `${size * 0.045}px`,
              fill: '#6b7280',
              fontWeight: 600,
            }}
          >
            {min}
          </text>

          {/* Max label */}
          <text
            x={polarToCartesian(endAngle).x}
            y={Math.min(polarToCartesian(endAngle).y + 20, svgHeight - 5)}
            textAnchor="end"
            style={{
              fontSize: `${size * 0.045}px`,
              fill: '#6b7280',
              fontWeight: 600,
            }}
          >
            {max}
          </text>

          {/* Center value display */}
          <text
            x={centerX}
            y={centerY - size * 0.02}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: `${size * 0.15}px`,
              fill: currentValue !== null ? getColor() : '#9ca3af',
              fontWeight: 700,
              transition: 'fill 0.5s ease-out',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {displayValue}
          </text>

          {/* Unit label */}
          {unit && (
            <text
              x={centerX}
              y={centerY + size * 0.09}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: `${size * 0.055}px`,
                fill: '#6b7280',
                fontWeight: 500,
              }}
            >
              {unit}
            </text>
          )}
          </g>
        </svg>

        {/* Range label */}
        <div style={{
          textAlign: 'center',
          marginTop: '5px',
          fontSize: `${size * 0.045}px`,
          color: '#9ca3af',
          fontWeight: 500,
        }}>
          Range: {min} - {max} {unit}
        </div>
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
