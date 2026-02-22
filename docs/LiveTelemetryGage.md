# LiveTelemetryGage

A modern, animated circular gauge component for displaying real-time telemetry data from WebSocket connections. Perfect for SCADA systems, IoT dashboards, and monitoring applications that need at-a-glance status indicators.

## Features

- 🎯 **Real-time gauge visualization** - Displays live streaming data on a circular gauge
- 🌈 **Dynamic color transitions** - Smooth color changes from green (low) to yellow (mid) to red (high)
- ✨ **Modern design** - Sleek, minimalist SVG-based gauge with smooth animations
- 📊 **Customizable ranges** - Set min/max values to match your sensor specifications
- 🎨 **Custom color schemes** - Configure colors for different value ranges
- 🔢 **Flexible formatting** - Control decimal places and unit labels
- 🟢 **Live status indicator** - Visual connection status badge
- 🔌 **WebSocket powered** - Real-time data through WebSocket connections

## Installation

```bash
npm install scadable
```

## Basic Usage

### Simple Example

```tsx
import { LiveTelemetryGage } from 'scadable';

function TemperatureGauge() {
  return (
    <LiveTelemetryGage
      apiKey="your-api-key"
      deviceId="your-device-id"
      title="Engine Temperature"
      dataPath=".data.temperature"
      min={0}
      max={100}
      unit="°C"
    />
  );
}
```

### Using a Device Instance

For more control, you can pass a pre-configured `Device` instance:

```tsx
import { Facility, Device, LiveTelemetryGage } from 'scadable';

function PressureGauge() {
  const facility = new Facility('your-api-key');
  const device = new Device(facility, 'your-device-id');

  return (
    <LiveTelemetryGage
      device={device}
      title="System Pressure"
      dataPath=".data.pressure"
      min={0}
      max={200}
      unit="PSI"
      decimals={0}
    />
  );
}
```

## Understanding JSON Paths

The gauge uses **JSON path notation** to extract data from the WebSocket payload. Given this example payload:

```json
{
  "broker_id": "service-mqtt-6446d94bf6-pn8x7",
  "device_id": "mifKUN32sahJNOvo",
  "payload": "Mw==",
  "qos": 0,
  "timestamp": "2025-11-06T19:54:50.802707085Z",
  "topic": "sensors/temperature",
  "data": {
    "temperature": 72.5,
    "pressure": 145.3,
    "rpm": 3500
  }
}
```

You would configure:

- **dataPath**: `".data.temperature"` - Extracts the temperature from the nested data object

### Path Examples

| Path | Extracts | Value |
|------|----------|-------|
| `".data.temperature"` | Nested temperature | `72.5` |
| `".data.pressure"` | Nested pressure | `145.3` |
| `".data.rpm"` | Nested RPM | `3500` |
| `".qos"` | Quality of service | `0` |

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Gauge title displayed at the top |
| `dataPath` | `string` | JSON path to extract value (e.g., `".data.temperature"`) |
| `min` | `number` | Minimum range value (gauge starts here) |
| `max` | `number` | Maximum range value (gauge ends here) |

### Connection Props (Choose One)

Either provide a Device instance OR apiKey + deviceId:

| Prop | Type | Description |
|------|------|-------------|
| `device` | `Device` | Pre-configured Device instance |
| `apiKey` | `string` | API key for authentication |
| `deviceId` | `string` | Device ID to connect to |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `unit` | `string` | `""` | Unit label (e.g., "°C", "PSI", "RPM") |
| `decimals` | `number` | `1` | Number of decimal places to display |
| `size` | `number` | `300` | Gauge width and height in pixels |
| `colorLow` | `string` | `"#22c55e"` | Color for low values (green) |
| `colorMid` | `string` | `"#eab308"` | Color for medium values (yellow) |
| `colorHigh` | `string` | `"#ef4444"` | Color for high values (red) |

## Advanced Examples

### Temperature Gauge with Custom Range

```tsx
<LiveTelemetryGage
  apiKey="your-api-key"
  deviceId="temp-sensor"
  title="Engine Temperature"
  dataPath=".data.temperature"
  min={0}
  max={120}
  unit="°C"
  decimals={1}
  size={350}
/>
```

### Pressure Gauge with Custom Colors

```tsx
<LiveTelemetryGage
  apiKey="your-api-key"
  deviceId="pressure-sensor"
  title="Hydraulic Pressure"
  dataPath=".data.pressure"
  min={0}
  max={200}
  unit="PSI"
  decimals={0}
  size={300}
  colorLow="#3b82f6"    // Blue
  colorMid="#8b5cf6"    // Purple
  colorHigh="#ec4899"   // Pink
/>
```

### RPM Gauge (No Decimals)

```tsx
<LiveTelemetryGage
  apiKey="your-api-key"
  deviceId="motor-sensor"
  title="Motor Speed"
  dataPath=".data.rpm"
  min={0}
  max={10000}
  unit="RPM"
  decimals={0}
  size={320}
/>
```

### Multiple Gauges Dashboard

```tsx
import { LiveTelemetryGage } from 'scadable';

function Dashboard() {
  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      <LiveTelemetryGage
        apiKey="your-api-key"
        deviceId="sensor-1"
        title="Temperature"
        dataPath=".data.temperature"
        min={0}
        max={100}
        unit="°C"
        size={250}
      />

      <LiveTelemetryGage
        apiKey="your-api-key"
        deviceId="sensor-2"
        title="Pressure"
        dataPath=".data.pressure"
        min={0}
        max={200}
        unit="PSI"
        decimals={0}
        size={250}
      />

      <LiveTelemetryGage
        apiKey="your-api-key"
        deviceId="sensor-3"
        title="RPM"
        dataPath=".data.rpm"
        min={0}
        max={8000}
        unit="RPM"
        decimals={0}
        size={250}
      />
    </div>
  );
}
```

### Compact Gauges for Space-Constrained UIs

```tsx
<LiveTelemetryGage
  apiKey="your-api-key"
  deviceId="your-device-id"
  title="Temp"
  dataPath=".data.temperature"
  min={0}
  max={50}
  unit="°C"
  size={180}
/>
```

## Best Practices

### Setting Min/Max Range

Choose `min` and `max` based on your sensor specifications:

- ✅ **Good**: `min={0}`, `max={100}` for 0-100°C temperature sensor
- ✅ **Good**: `min={0}`, `max={200}` for 0-200 PSI pressure sensor
- ✅ **Good**: `min={0}`, `max={10000}` for 0-10k RPM motor
- ❌ **Bad**: `min={0}`, `max={1000}` for data that only goes 0-50 (gauge mostly empty)

### Decimal Places

Balance between precision and readability:

- **0 decimals**: Good for RPM, counts, large numbers (e.g., `3500 RPM`)
- **1 decimal**: Good for temperature, pressure (e.g., `72.5 °C`)
- **2 decimals**: Good for precise measurements (e.g., `3.14 V`)

### Gauge Size

Choose size based on your layout:

- **180-200px**: Compact, for multi-gauge dashboards
- **250-300px**: Standard, good for most use cases (default: 300)
- **320-400px**: Large, for primary/critical metrics

### Color Schemes

#### Standard (Traffic Light)
```tsx
colorLow="#22c55e"   // Green (good)
colorMid="#eab308"   // Yellow (warning)
colorHigh="#ef4444"  // Red (danger)
```

#### Cool (Blue to Pink)
```tsx
colorLow="#3b82f6"   // Blue
colorMid="#8b5cf6"   // Purple
colorHigh="#ec4899"  // Pink
```

#### Monochrome (Single Color Intensity)
```tsx
colorLow="#cbd5e1"   // Light gray
colorMid="#64748b"   // Medium gray
colorHigh="#1e293b"  // Dark gray
```

## Color Transition Logic

The gauge automatically changes color based on the current value percentage:

- **0-33%** of range: Uses `colorLow`
- **34-66%** of range: Uses `colorMid`
- **67-100%** of range: Uses `colorHigh`

For example, with `min={0}` and `max={100}`:
- Value 25: Green (`colorLow`)
- Value 50: Yellow (`colorMid`)
- Value 85: Red (`colorHigh`)

## Visual Design

The gauge includes:

- **Circular arc** (270° sweep from bottom-left to bottom-right)
- **Large centered value** with dynamic color
- **Unit label** below the value
- **Min/Max labels** at arc endpoints
- **Range display** below the gauge
- **Live status badge** (top-right corner with pulsing indicator)
- **Smooth transitions** (0.5s ease-out animations)
- **Drop shadow** on the active arc for depth

## Troubleshooting

### Gauge not displaying data

1. Verify your API key and device ID are correct
2. Check that the WebSocket connection shows "Live" status
3. Verify JSON path matches your payload structure
4. Check browser console for errors
5. Ensure the extracted value is a number

### Gauge shows "--"

- No data received yet (connection establishing)
- JSON path doesn't match payload structure
- Value at path is not a valid number

### Range issues

- Ensure `min < max`
- Set range to match sensor specifications
- Value outside range will be clamped to 0% or 100%

### Colors not changing

- Verify `colorLow`, `colorMid`, `colorHigh` are valid CSS colors
- Colors transition at 33% and 67% boundaries
- Check that values are in expected range

## Accessibility

The gauge component:

- Uses semantic HTML and ARIA-compliant SVG
- Includes text labels for screen readers
- Displays numerical value prominently
- Shows connection status visually and textually

## Performance

- Lightweight SVG-based rendering
- Smooth CSS transitions (no JavaScript animation loops)
- Efficient WebSocket data handling
- Minimal re-renders with React hooks

## TypeScript Support

The component is fully typed. Import types:

```tsx
import type { LiveTelemetryGageProps } from 'scadable';

const gaugeProps: LiveTelemetryGageProps = {
  device: myDevice,
  title: "My Gauge",
  dataPath: ".data.value",
  min: 0,
  max: 100,
  unit: "V",
  decimals: 2,
  size: 300,
};
```

## See Also

- [Facility Class](./Facility.md)
- [Device Class](./Device.md)
- [useLiveTelemetry Hook](./useLiveTelemetry.md)
- [LiveTelemetryLineChart Component](./LiveTelemetryLineChart.md)
