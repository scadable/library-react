# scadable

A React library for consuming real-time telemetry data through WebSocket connections.

## Features

- 🔌 **WebSocket Integration**: Seamless connection to telemetry data streams.
- ⚛️ **React Hooks**: Simple `useLiveTelemetry` hook for real-time data consumption.
- 🛡️ **TypeScript Support**: Full type safety with comprehensive TypeScript definitions.
- 🧪 **Comprehensive Tests**: Unit and integration tests with WebSocket mocks.
- 🔧 **Easy Setup**: Simple API with minimal configuration required.

## Installation

```bash
npm install scadable
````

## Quick Start

```tsx
import React from "react";
import { Facility, Device } from "scadable";
import { useLiveTelemetry } from "scadable/hooks";
import { TelemetryDisplay } from "scadable/components";

// Initialize facility and device
const facility = new Facility("your-api-key");
const device = new Device(facility, "your-device-id");

function App() {
  return <TelemetryDisplay device={device} />;
}
```

## API Reference

### `Facility`

Manages the API key for WebSocket authentication.

```tsx
const facility = new Facility("your-api-key");
```

#### Methods

- `connect(deviceId: string)`: Creates and returns a WebSocket instance.

### `Device`

Manages the device ID and WebSocket connection.

```tsx
const device = new Device(facility, "device-id");
```

#### Methods

- `connect()`: Establishes the WebSocket connection.
- `disconnect()`: Closes the WebSocket connection.
- `onMessage(handler)`: Subscribes to telemetry messages.
- `onError(handler)`: Subscribes to connection errors.
- `onStatusChange(handler)`: Subscribes to connection status changes.

### `useLiveTelemetry` Hook

A React hook for consuming real-time telemetry data.

```tsx
const { telemetry, isConnected, error } = useLiveTelemetry(device);
```

## Development

### Running Storybook

To see a live example of the library in action, run Storybook:

```bash
npm run storybook
```

This will open a new browser window with the `TelemetryDisplay` component, showcasing the `useLiveTelemetry` hook with a mock data stream.

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

