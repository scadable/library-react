# useLiveTelemetry Hook

A React hook for consuming real-time telemetry data from WebSocket connections. This hook automatically manages the connection lifecycle and provides telemetry data, connection status, and error handling.

## Features

- 🔌 **Automatic connection management** - Connects on mount, disconnects on unmount
- 📡 **Real-time data updates** - Receives telemetry data as it arrives
- 🔄 **Connection status tracking** - Know when you're connected, disconnected, or connecting
- ⚠️ **Error handling** - Catches and reports connection errors
- 🧹 **Cleanup on unmount** - Automatically disconnects and cleans up subscriptions
- ⚛️ **React-friendly** - Follows React hooks best practices

## Installation

```bash
npm install scadable
```

## Basic Usage

### Simple Example

```tsx
import { Facility, Device, useLiveTelemetry } from 'scadable';

function TelemetryMonitor() {
  // Create facility and device
  const facility = new Facility('your-api-key');
  const device = new Device(facility, 'your-device-id');

  // Use the hook
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  return (
    <div>
      <h2>Live Telemetry</h2>

      {/* Connection Status */}
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>

      {/* Error Display */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Telemetry Data */}
      <pre>{JSON.stringify(telemetry, null, 2)}</pre>
    </div>
  );
}
```

## Return Value

The hook returns an object with three properties:

| Property | Type | Description |
|----------|------|-------------|
| `telemetry` | `TelemetryData \| string \| null` | The most recent telemetry data received |
| `isConnected` | `boolean` | `true` if connected to WebSocket, `false` otherwise |
| `error` | `string \| null` | Error message if connection failed, `null` otherwise |

### Telemetry Data Structure

The telemetry data contains the full Scadable payload:

```typescript
interface ScadablePayload {
  broker_id: string;
  device_id: string;
  payload: string;
  qos: number;
  timestamp: string;
  topic: string;
  data: {
    [key: string]: any;  // Your sensor data
  };
}
```

Example payload:

```json
{
  "broker_id": "service-mqtt-6446d94bf6-pn8x7",
  "device_id": "mifKUN32sahJNOvo",
  "payload": "Mw==",
  "qos": 0,
  "timestamp": "2025-11-06T19:54:50.802707085Z",
  "topic": "sensors/temperature",
  "data": {
    "tempreture": 23.5
  }
}
```

## Advanced Examples

### Displaying Specific Sensor Values

```tsx
import { Facility, Device, useLiveTelemetry } from 'scadable';

function TemperatureDisplay() {
  const facility = new Facility('your-api-key');
  const device = new Device(facility, 'your-device-id');
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  // Extract temperature from nested data
  const temperature = telemetry &&
    typeof telemetry === 'object' &&
    'data' in telemetry &&
    telemetry.data?.tempreture;

  return (
    <div>
      <h2>Temperature Monitor</h2>
      <p>Status: {isConnected ? 'Online' : 'Offline'}</p>

      {error && <div className="error">{error}</div>}

      {temperature !== undefined ? (
        <h1>{temperature}°C</h1>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
}
```

### Multiple Sensors

Monitor multiple devices simultaneously:

```tsx
import { Facility, Device, useLiveTelemetry } from 'scadable';

function MultiSensorDashboard() {
  const facility = new Facility('your-api-key');

  // Create multiple device instances
  const device1 = new Device(facility, 'device-1');
  const device2 = new Device(facility, 'device-2');
  const device3 = new Device(facility, 'device-3');

  // Use hook for each device
  const sensor1 = useLiveTelemetry(device1);
  const sensor2 = useLiveTelemetry(device2);
  const sensor3 = useLiveTelemetry(device3);

  return (
    <div className="dashboard">
      <SensorCard name="Sensor 1" data={sensor1} />
      <SensorCard name="Sensor 2" data={sensor2} />
      <SensorCard name="Sensor 3" data={sensor3} />
    </div>
  );
}

function SensorCard({ name, data }) {
  const { telemetry, isConnected, error } = data;

  return (
    <div className="card">
      <h3>{name}</h3>
      <div className={isConnected ? 'status-online' : 'status-offline'}>
        {isConnected ? '●' : '○'}
      </div>
      {error && <p className="error">{error}</p>}
      <pre>{JSON.stringify(telemetry, null, 2)}</pre>
    </div>
  );
}
```

### Tracking Data History

Store telemetry history in state:

```tsx
import { useState, useEffect } from 'react';
import { Facility, Device, useLiveTelemetry } from 'scadable';

function TelemetryHistory() {
  const facility = new Facility('your-api-key');
  const device = new Device(facility, 'your-device-id');
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (telemetry) {
      setHistory(prev => [
        ...prev,
        { data: telemetry, timestamp: Date.now() }
      ].slice(-20)); // Keep last 20 readings
    }
  }, [telemetry]);

  return (
    <div>
      <h2>Telemetry History</h2>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Total readings: {history.length}</p>

      <div className="history">
        {history.map((item, index) => (
          <div key={index} className="reading">
            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
            <pre>{JSON.stringify(item.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Conditional Rendering Based on Connection

```tsx
import { Facility, Device, useLiveTelemetry } from 'scadable';

function SmartTelemetryDisplay() {
  const facility = new Facility('your-api-key');
  const device = new Device(facility, 'your-device-id');
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  // Show loading state
  if (!isConnected && !error) {
    return (
      <div className="loading">
        <p>Connecting to device...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-state">
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry Connection
        </button>
      </div>
    );
  }

  // Show telemetry data
  return (
    <div className="telemetry">
      <div className="status-badge">🟢 Live</div>

      {telemetry ? (
        <div>
          <h3>Current Reading</h3>
          <div className="data-display">
            {typeof telemetry === 'object' && 'data' in telemetry && (
              <>
                <p>Topic: {telemetry.topic}</p>
                <p>Timestamp: {new Date(telemetry.timestamp).toLocaleString()}</p>
                <div className="sensor-values">
                  {Object.entries(telemetry.data).map(([key, value]) => (
                    <div key={key} className="sensor-value">
                      <span className="label">{key}:</span>
                      <span className="value">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
}
```

### Custom Alert System

Create alerts based on telemetry values:

```tsx
import { useState, useEffect } from 'react';
import { Facility, Device, useLiveTelemetry } from 'scadable';

function TemperatureAlert() {
  const facility = new Facility('your-api-key');
  const device = new Device(facility, 'your-device-id');
  const { telemetry, isConnected } = useLiveTelemetry(device);

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (telemetry && typeof telemetry === 'object' && 'data' in telemetry) {
      const temp = telemetry.data?.tempreture;

      // Check for high temperature
      if (temp > 35) {
        setAlerts(prev => [
          ...prev,
          {
            type: 'warning',
            message: `High temperature detected: ${temp}°C`,
            timestamp: Date.now()
          }
        ]);
      }

      // Check for critical temperature
      if (temp > 40) {
        setAlerts(prev => [
          ...prev,
          {
            type: 'critical',
            message: `CRITICAL: Temperature ${temp}°C exceeds safe limit!`,
            timestamp: Date.now()
          }
        ]);
      }
    }
  }, [telemetry]);

  return (
    <div>
      <h2>Temperature Monitoring</h2>
      <p>Status: {isConnected ? '🟢 Monitoring' : '🔴 Offline'}</p>

      <div className="alerts">
        {alerts.slice(-5).reverse().map((alert, index) => (
          <div key={index} className={`alert alert-${alert.type}`}>
            <strong>{alert.type.toUpperCase()}:</strong> {alert.message}
            <br />
            <small>{new Date(alert.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>

      {telemetry && typeof telemetry === 'object' && 'data' in telemetry && (
        <div className="current-temp">
          <h1>{telemetry.data?.tempreture}°C</h1>
        </div>
      )}
    </div>
  );
}
```

## TypeScript Support

The hook is fully typed with TypeScript:

```typescript
import { Device } from 'scadable';
import type { TelemetryData } from 'scadable';

interface TelemetryHookResult {
  telemetry: TelemetryData | string | null;
  isConnected: boolean;
  error: string | null;
}

function MyComponent() {
  const device: Device = new Device(facility, 'device-id');
  const { telemetry, isConnected, error }: TelemetryHookResult = useLiveTelemetry(device);

  // Type-safe access to telemetry data
  if (telemetry && typeof telemetry === 'object' && 'data' in telemetry) {
    const temperature: number = telemetry.data.tempreture;
  }
}
```

## Best Practices

### 1. Memoize Device Instance

Avoid recreating the device on every render:

```tsx
import { useMemo } from 'react';

function MyComponent() {
  // ✅ Good: Device created once
  const device = useMemo(() => {
    const facility = new Facility('your-api-key');
    return new Device(facility, 'your-device-id');
  }, []);

  const { telemetry } = useLiveTelemetry(device);
}
```

### 2. Handle Loading States

Always show a loading indicator while connecting:

```tsx
if (!isConnected && !error && !telemetry) {
  return <div>Connecting...</div>;
}
```

### 3. Type Check Telemetry Data

Always verify the data structure before accessing nested properties:

```tsx
if (telemetry && typeof telemetry === 'object' && 'data' in telemetry) {
  const value = telemetry.data?.yourField;
}
```

### 4. Clean Error Messages

Present errors in a user-friendly way:

```tsx
{error && (
  <div className="error-banner">
    Unable to connect to sensor. Please check your connection.
  </div>
)}
```

## Connection Lifecycle

The hook automatically manages the WebSocket connection:

1. **On Mount** - Calls `device.connect()` and subscribes to events
2. **During Use** - Updates state when messages arrive
3. **On Unmount** - Calls `device.disconnect()` and unsubscribes from all events

This ensures no memory leaks and proper cleanup when the component unmounts.

## Troubleshooting

### Hook returns null telemetry

- Check that the device is properly configured with valid API key and device ID
- Verify that the device is sending data
- Check browser console for WebSocket errors

### Connection status stays false

- Verify your API key is correct
- Check that the device ID exists
- Ensure your network allows WebSocket connections

### Error: "Device instance is required"

- Make sure you're passing a valid `Device` instance to the hook
- The device must be created before calling the hook

### Data updates are slow

- This is normal - data updates as fast as the device sends it
- Check your device's publishing interval
- WebSocket connections have minimal latency

## Related

- [Device Class](./Device.md)
- [Facility Class](./Facility.md)
- [LiveTelemetryLineChart Component](./LiveTelemetryLineChart.md)
- [TelemetryDisplay Component](./TelemetryDisplay.md)

## API Reference

### Parameters

```typescript
useLiveTelemetry(device: Device): TelemetryHookResult
```

**device** - A `Device` instance configured with a facility and device ID

### Return Type

```typescript
interface TelemetryHookResult {
  telemetry: TelemetryData | string | null;
  isConnected: boolean;
  error: string | null;
}
```
