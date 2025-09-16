# Scadable Stream

A React library for consuming real-time telemetry data through WebSocket connections.

## Features

- 🔌 **WebSocket Integration**: Seamless connection to telemetry data streams
- ⚛️ **React Hooks**: Simple `useLiveTelemetry` hook for real-time data consumption
- 🛡️ **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- 🧪 **100% Test Coverage**: Comprehensive unit tests with WebSocket mocks
- 🔧 **Easy Setup**: Simple API with minimal configuration required

## Installation

```bash
npm install scadable-stream
```

## Quick Start

```tsx
import React, { useEffect } from "react";
import { Facility, Device, useLiveTelemetry } from "scadable-stream";

// Initialize facility and device
const facility = new Facility("your-api-key");
const device = new Device(facility, "your-device-id");

function App() {
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  useEffect(() => {
    if (telemetry) {
      console.log("Telemetry received:", telemetry);
    }
  }, [telemetry]);

  return (
    <div>
      <h1>Scadable Stream</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      {error && <p>Error: {error}</p>}
      <p>
        Temperature:{" "}
        {telemetry && typeof telemetry === "object" && "temperature" in telemetry 
          ? telemetry.temperature 
          : "--"}
      </p>
    </div>
  );
}
```

## API Reference

### Facility

Manages the API key for WebSocket authentication.

```tsx
const facility = new Facility("your-api-key");
```

#### Methods

- `getApiKey()`: Returns the API key
- `isValid()`: Validates that the facility has a valid API key

### Device

Manages device ID and WebSocket connection.

```tsx
const device = new Device(facility, "device-id");
```

#### Methods

- `getDeviceId()`: Returns the device ID
- `getConnectionStatus()`: Returns current connection status
- `connect(baseUrl?)`: Establishes WebSocket connection
- `disconnect()`: Closes WebSocket connection
- `isConnected()`: Checks if device is currently connected
- `onMessage(handler)`: Subscribe to telemetry messages
- `onError(handler)`: Subscribe to connection errors
- `onStatusChange(handler)`: Subscribe to connection status changes

### useLiveTelemetry Hook

React hook for consuming real-time telemetry data.

```tsx
const { telemetry, isConnected, error } = useLiveTelemetry(device);
```

#### Returns

- `telemetry`: Latest telemetry data (parsed JSON object or raw string)
- `isConnected`: Boolean indicating connection status
- `error`: Error message if connection fails

## WebSocket Connection

The library connects to WebSocket endpoints using URL parameters:

```
wss://api.scadable.com?token=<api_key>&deviceid=<device_id>
```

### Message Handling

- **Valid JSON**: Messages are parsed into objects and provided as telemetry state
- **Invalid JSON**: Raw string messages are returned as telemetry state

## TypeScript Support

The library provides comprehensive TypeScript definitions:

```tsx
import { 
  TelemetryData, 
  ConnectionStatus, 
  TelemetryHookResult 
} from "scadable-stream";

interface CustomTelemetry extends TelemetryData {
  temperature: number;
  humidity: number;
  pressure: number;
}
```

## Testing

The library includes comprehensive unit tests with WebSocket mocks:

```bash
npm test
```

### Test Coverage

- ✅ Facility class validation and API key management
- ✅ Device class WebSocket connection and message handling
- ✅ useLiveTelemetry hook state management and cleanup
- ✅ Integration tests with React components
- ✅ Error handling and edge cases

## Examples

### Basic Usage

```tsx
import React from "react";
import { Facility, Device, useLiveTelemetry } from "scadable-stream";

const facility = new Facility("secure-key");
const device = new Device(facility, "device-id");

export default function TelemetryDisplay() {
  const { telemetry, isConnected, error } = useLiveTelemetry(device);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Device Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</h2>
      {telemetry && (
        <div>
          <h3>Latest Data:</h3>
          <pre>{JSON.stringify(telemetry, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### Custom WebSocket URL

```tsx
const device = new Device(facility, "device-id");
device.connect("wss://custom-api.example.com");
```

### Multiple Devices

```tsx
const facility = new Facility("api-key");
const device1 = new Device(facility, "device-1");
const device2 = new Device(facility, "device-2");

function MultiDeviceApp() {
  const telemetry1 = useLiveTelemetry(device1);
  const telemetry2 = useLiveTelemetry(device2);

  return (
    <div>
      <div>Device 1: {telemetry1.telemetry?.temperature || "--"}°C</div>
      <div>Device 2: {telemetry2.telemetry?.temperature || "--"}°C</div>
    </div>
  );
}
```

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Storybook

```bash
npm run storybook
```

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/scadable/library-react).