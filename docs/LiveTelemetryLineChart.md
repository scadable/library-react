# LiveTelemetryLineChart

A real-time line chart component for displaying live telemetry data from WebSocket connections. Perfect for SCADA systems, IoT dashboards, and monitoring applications.

## Features

- 📊 **Real-time data visualization** - Displays live streaming data
- 🎨 **Customizable appearance** - Configure colors, dimensions, and styling
- 📍 **Fixed Y-axis** - Stable scale prevents confusing movement
- 🔄 **Smooth scrolling** - Data flows from right to left like a strip chart
- 🎯 **JSON path extraction** - Flexible data mapping using dot notation
- 🟢 **Live status indicator** - Visual connection status badge
- 🔌 **WebSocket powered** - Real-time data through WebSocket connections

## Installation

```bash
npm install scadable
```

## Basic Usage

### Simple Example

```tsx
import { LiveTelemetryLineChart } from 'scadable';

function TemperatureMonitor() {
  return (
    <LiveTelemetryLineChart
      apiKey="your-api-key"
      deviceId="your-device-id"
      title="Temperature Monitor"
      xAxisLabel="Time"
      yAxisLabel="Temperature (°C)"
      xDataPath=".timestamp"
      yDataPath=".data.tempreture"
      yMin={0}
      yMax={50}
      lineColor="#8884d8"
    />
  );
}
```

### Using a Device Instance

For more control, you can pass a pre-configured `Device` instance:

```tsx
import { Facility, Device, LiveTelemetryLineChart } from 'scadable';

function TemperatureMonitor() {
  const facility = new Facility('your-api-key');
  const device = new Device(facility, 'your-device-id');

  return (
    <LiveTelemetryLineChart
      device={device}
      title="Temperature Monitor"
      xAxisLabel="Time"
      yAxisLabel="Temperature (°C)"
      xDataPath=".timestamp"
      yDataPath=".data.tempreture"
      yMin={0}
      yMax={50}
      lineColor="#22c55e"
    />
  );
}
```

## Understanding JSON Paths

The chart uses **JSON path notation** to extract data from the WebSocket payload. Given this example payload:

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

You would configure:

- **xDataPath**: `".timestamp"` - Extracts the timestamp from the root level
- **yDataPath**: `".data.tempreture"` - Extracts the temperature from the nested data object

### Path Examples

| Path | Extracts | Value |
|------|----------|-------|
| `".timestamp"` | Root-level timestamp | `"2025-11-06T19:54:50.802707085Z"` |
| `".data.tempreture"` | Nested temperature | `23.5` |
| `".qos"` | Quality of service | `0` |
| `".topic"` | MQTT topic | `"sensors/temperature"` |

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Chart title displayed at the top (centered) |
| `xAxisLabel` | `string` | Label for the X-axis (typically "Time") |
| `yAxisLabel` | `string` | Label for the Y-axis (e.g., "Temperature (°C)") |
| `xDataPath` | `string` | JSON path to extract X-axis value (e.g., `".timestamp"`) |
| `yDataPath` | `string` | JSON path to extract Y-axis value (e.g., `".data.tempreture"`) |
| `yMin` | `number` | Minimum Y-axis value (fixed scale) |
| `yMax` | `number` | Maximum Y-axis value (fixed scale) |

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
| `lineColor` | `string` | `"#8884d8"` | Color of the chart line (hex or CSS color) |
| `maxDataPoints` | `number` | `20` | Maximum number of data points to display |
| `width` | `number` | `600` | Chart width in pixels |
| `height` | `number` | `400` | Chart height in pixels |

## Advanced Examples

### Multiple Sensors with Different Colors

```tsx
import { LiveTelemetryLineChart } from 'scadable';

function MultiSensorDashboard() {
  return (
    <div>
      <LiveTelemetryLineChart
        apiKey="your-api-key"
        deviceId="sensor-1"
        title="Temperature Sensor 1"
        xAxisLabel="Time"
        yAxisLabel="Temperature (°C)"
        xDataPath=".timestamp"
        yDataPath=".data.tempreture"
        yMin={0}
        yMax={50}
        lineColor="#ef4444"
        width={800}
        height={400}
      />

      <LiveTelemetryLineChart
        apiKey="your-api-key"
        deviceId="sensor-2"
        title="Temperature Sensor 2"
        xAxisLabel="Time"
        yAxisLabel="Temperature (°C)"
        xDataPath=".timestamp"
        yDataPath=".data.tempreture"
        yMin={0}
        yMax={50}
        lineColor="#22c55e"
        width={800}
        height={400}
      />
    </div>
  );
}
```

### Custom Data Range

For monitoring pressure with different scale:

```tsx
<LiveTelemetryLineChart
  apiKey="your-api-key"
  deviceId="pressure-sensor"
  title="Pressure Monitor"
  xAxisLabel="Time"
  yAxisLabel="Pressure (PSI)"
  xDataPath=".timestamp"
  yDataPath=".data.pressure"
  yMin={0}
  yMax={150}
  lineColor="#f59e0b"
  maxDataPoints={50}
  width={1000}
  height={500}
/>
```

### Large Display with More Data Points

For detailed monitoring:

```tsx
<LiveTelemetryLineChart
  apiKey="your-api-key"
  deviceId="your-device-id"
  title="Extended Temperature History"
  xAxisLabel="Time"
  yAxisLabel="Temperature (°C)"
  xDataPath=".timestamp"
  yDataPath=".data.tempreture"
  yMin={0}
  yMax={50}
  lineColor="#8b5cf6"
  maxDataPoints={100}
  width={1200}
  height={600}
/>
```

## Best Practices

### Setting Y-axis Range

Choose `yMin` and `yMax` based on your expected data range:

- ✅ **Good**: `yMin={0}`, `yMax={50}` for temperature (0-50°C)
- ✅ **Good**: `yMin={-10}`, `yMax={60}` with buffer for temperature
- ❌ **Bad**: `yMin={0}`, `yMax={100}` for data that only goes 0-25 (too much empty space)

### Number of Data Points

Balance between detail and readability:

- **20-30 points**: Good for quick overview, less cluttered
- **50-100 points**: More detail, better for trend analysis
- **100+ points**: Very detailed but may impact performance

### Color Selection

Choose colors that match your application theme:

```tsx
// Status colors
lineColor="#22c55e"  // Green - normal operation
lineColor="#f59e0b"  // Amber - warning
lineColor="#ef4444"  // Red - critical

// Standard colors
lineColor="#8884d8"  // Blue
lineColor="#82ca9d"  // Teal
lineColor="#ffc658"  // Yellow
```

## Styling & Customization

The chart has a transparent background and integrates seamlessly into any design. The component includes:

- **Centered title**
- **Live status badge** (top-right corner with pulsing indicator)
- **Clean grid lines** (horizontal only)
- **Gradient fill** under the line
- **Interactive tooltip** on hover
- **Data point counter** (bottom)

## Troubleshooting

### Chart not displaying data

1. Verify your API key and device ID are correct
2. Check that the WebSocket connection shows "Live" status
3. Verify JSON paths match your payload structure
4. Check browser console for errors

### Y-axis range issues

- Ensure `yMin < yMax`
- Set range to include all expected values
- Add 10-20% buffer above/below expected range

### Data scrolling too fast/slow

Adjust `maxDataPoints`:
- Increase for slower scrolling (more history)
- Decrease for faster scrolling (less history)

## TypeScript Support

The component is fully typed. Import types:

```tsx
import type { LiveTelemetryLineChartProps } from 'scadable';

const chartProps: LiveTelemetryLineChartProps = {
  device: myDevice,
  title: "My Chart",
  xAxisLabel: "Time",
  yAxisLabel: "Value",
  xDataPath: ".timestamp",
  yDataPath: ".data.value",
  yMin: 0,
  yMax: 100,
};
```

## See Also

- [Facility Class](./Facility.md)
- [Device Class](./Device.md)
- [useLiveTelemetry Hook](./useLiveTelemetry.md)
- [TelemetryDisplay Component](./TelemetryDisplay.md)