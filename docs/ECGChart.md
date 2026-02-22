# ECGChart Component

A real-time electrocardiogram (ECG/EKG) visualization component with medical-standard grid display, heart rate calculation, and full color customization.

## Medical Context

An **ECG (Electrocardiogram)** records the electrical activity of the heart over time. Each heartbeat produces a characteristic waveform pattern:

- **P wave**: Atrial depolarization (atria contract)
- **QRS complex**: Ventricular depolarization (ventricles contract) - the sharp spike
- **T wave**: Ventricular repolarization (ventricles relax)

ECG is used to detect heart rhythm abnormalities, heart attacks, and other cardiac conditions.

## Installation

```bash
npm install scadable
```

## Import

```typescript
import { ECGChart } from 'scadable/health';
```

## Basic Usage

### Real-time Mode

```tsx
import { ECGChart } from 'scadable/health';

function MyComponent() {
  return (
    <ECGChart
      apiKey="your-api-key"
      deviceId="ecg-device-001"
      dataPath=".data.ecg"
      title="Patient ECG Monitor"
      showHeartRate={true}
      onHeartRateChange={(bpm) => console.log('Heart rate:', bpm)}
    />
  );
}
```

### With Pre-configured Device

```tsx
import { ECGChart, Facility, Device } from 'scadable/health';

const facility = new Facility('your-api-key');
const device = new Device(facility, 'ecg-device-001');

function MyComponent() {
  return (
    <ECGChart
      device={device}
      dataPath=".data.ecg"
      title="ECG Monitor"
    />
  );
}
```

### Historical Mode

```tsx
import { ECGChart } from 'scadable/health';

const historicalECGData = [0.1, 0.15, 0.8, 0.3, 0.05, -0.1, 0.25, ...]; // ECG values in mV

function MyComponent() {
  return (
    <ECGChart
      mode="historical"
      historicalData={historicalECGData}
      dataPath=".data.ecg"
      title="Pre-recorded ECG"
      samplingRate={250}
    />
  );
}
```

## Props Reference

### Connection Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiKey` | `string` | Conditional* | API key for authentication |
| `deviceId` | `string` | Conditional* | Device ID to connect to |
| `device` | `Device` | Conditional* | Pre-configured Device instance |

*Either provide `device` OR both `apiKey` and `deviceId` (for realtime mode only)

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataPath` | `string` | Required | JSON path to extract ECG value (e.g., ".data.ecg") |
| `mode` | `'realtime' \| 'historical'` | `'realtime'` | Display mode |
| `historicalData` | `number[]` | - | Pre-recorded ECG values (mV) for historical mode |

### Display Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'ECG Monitor'` | Chart title |
| `width` | `number` | `800` | Chart width in pixels |
| `height` | `number` | `400` | Chart height in pixels |

### Medical Settings

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sweepSpeed` | `25 \| 50` | `25` | Sweep speed in mm/s (standard: 25 or 50) |
| `gain` | `5 \| 10 \| 20` | `10` | Gain in mm/mV (standard: 5, 10, or 20) |
| `samplingRate` | `number` | `250` | Sampling rate in Hz (typical: 250-1000) |
| `showGrid` | `boolean` | `true` | Show medical-standard ECG grid |
| `showCalibration` | `boolean` | `true` | Show 1mV calibration pulse |
| `bufferDuration` | `number` | `10` | Buffer duration in seconds |

### Heart Rate Features

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showHeartRate` | `boolean` | `true` | Show heart rate display and calculation |
| `onHeartRateChange` | `(bpm: number) => void` | - | Callback when heart rate changes |

### Color Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `waveformColor` | `string` | `'#dc2626'` | ECG waveform color |
| `gridColor` | `string` | `'#f4c2c2'` | Grid line color |
| `backgroundColor` | `string` | `'#ffffff'` | Background color |

## ECG Grid Explanation

The ECG grid follows medical standards:
- **Small squares**: 1mm × 1mm
  - Horizontal: 0.04 seconds (at 25mm/s)
  - Vertical: 0.1mV (at 10mm/mV gain)
- **Large squares**: 5mm × 5mm (5 small squares)
  - Horizontal: 0.2 seconds
  - Vertical: 0.5mV

## Sweep Speed and Gain

### Sweep Speed
- **25 mm/s** (standard): Good for overall rhythm assessment
- **50 mm/s**: Better for detailed waveform analysis

### Gain
- **5 mm/mV**: For large amplitude signals
- **10 mm/mV** (standard): Most common setting
- **20 mm/mV**: For small amplitude signals

## Expected Data Format

The component expects WebSocket data in this format:

```json
{
  "broker_id": "service-mqtt-...",
  "device_id": "ecg-device-001",
  "timestamp": "2025-11-06T19:54:50.802Z",
  "data": {
    "ecg": 0.85
  }
}
```

Where `ecg` is the voltage value in **millivolts (mV)**.

Use `dataPath` to extract the value. For the above example: `dataPath=".data.ecg"`

## Heart Rate Calculation

When `showHeartRate={true}`, the component:
1. Detects R-peaks in the QRS complex using the Pan-Tompkins algorithm
2. Calculates R-R intervals (time between peaks)
3. Computes BPM: `60000 / average_RR_interval_ms`
4. Updates every 500ms
5. Colors the heart rate:
   - **Green**: 60-100 BPM (normal)
   - **Red**: <60 or >100 BPM (abnormal)

## Color Customization Examples

### Classic Medical (Default)
```tsx
<ECGChart
  waveformColor="#dc2626"
  gridColor="#f4c2c2"
  backgroundColor="#ffffff"
/>
```

### Blue Theme
```tsx
<ECGChart
  waveformColor="#3b82f6"
  gridColor="#93c5fd"
  backgroundColor="#eff6ff"
/>
```

### Dark Mode
```tsx
<ECGChart
  waveformColor="#22c55e"
  gridColor="#374151"
  backgroundColor="#1f2937"
/>
```

### High Contrast
```tsx
<ECGChart
  waveformColor="#000000"
  gridColor="#cccccc"
  backgroundColor="#ffffff"
/>
```

## Performance

- Supports up to **1000 Hz** sampling rate
- Renders at **60 FPS** using hardware-accelerated Canvas
- Memory efficient with circular buffer (default 10-second buffer)
- Optimized for mobile devices (30+ FPS)

## Best Practices

### 1. Choose Appropriate Settings
```tsx
// For rhythm analysis
<ECGChart sweepSpeed={25} gain={10} />

// For detailed waveform analysis
<ECGChart sweepSpeed={50} gain={20} />
```

### 2. Handle Heart Rate Updates
```tsx
const [currentBPM, setCurrentBPM] = useState(0);

<ECGChart
  showHeartRate={true}
  onHeartRateChange={(bpm) => {
    setCurrentBPM(bpm);
    if (bpm > 120) {
      alert('High heart rate detected!');
    }
  }}
/>
```

### 3. Responsive Sizing
```tsx
<div style={{ width: '100%', maxWidth: '1200px' }}>
  <ECGChart
    width={window.innerWidth > 800 ? 800 : 600}
    height={window.innerWidth > 800 ? 400 : 300}
  />
</div>
```

### 4. Error Handling
The component displays connection errors automatically. No additional error handling needed.

## Medical Disclaimer

⚠️ **IMPORTANT**: This component is for **visualization purposes only** and is **NOT intended for medical diagnosis or treatment**.

- Do not use for clinical decision-making
- Do not use as a replacement for medical-grade equipment
- Always consult qualified healthcare professionals
- This is educational/demo software, not medical device software

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support (with reduced FPS on older devices)

Requires:
- HTML5 Canvas support
- ES6+ JavaScript
- WebSocket support (for realtime mode)

## Troubleshooting

### No waveform displayed
- Check that `dataPath` matches your data structure
- Verify WebSocket connection is active (check connection indicator)
- Ensure ECG values are in millivolts (mV), typically -2 to +2 range

### Heart rate shows "--"
- Need at least 2 heartbeats for calculation
- Check that R-peaks are detectable (gain may be too low)
- Ensure sampling rate is configured correctly

### Poor performance
- Reduce `samplingRate` if not using medical-grade precision
- Reduce `bufferDuration` to use less memory
- Disable `showHeartRate` if not needed (saves CPU)

## Examples

### Multiple Patients Dashboard
```tsx
import { ECGChart, Facility, Device } from 'scadable/health';

function ICUDashboard() {
  const facility = new Facility('your-api-key');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
      <ECGChart
        device={new Device(facility, 'patient-1-ecg')}
        dataPath=".data.ecg"
        title="Patient 1 - Bed 1"
        width={600}
        height={300}
      />
      <ECGChart
        device={new Device(facility, 'patient-2-ecg')}
        dataPath=".data.ecg"
        title="Patient 2 - Bed 2"
        width={600}
        height={300}
      />
    </div>
  );
}
```

### With Alert System
```tsx
function ECGWithAlerts() {
  const handleHeartRateChange = (bpm: number) => {
    if (bpm > 120) {
      console.error('Tachycardia detected!');
      // Trigger alert system
    } else if (bpm < 50) {
      console.error('Bradycardia detected!');
      // Trigger alert system
    }
  };

  return (
    <ECGChart
      apiKey="your-api-key"
      deviceId="ecg-device-001"
      dataPath=".data.ecg"
      showHeartRate={true}
      onHeartRateChange={handleHeartRateChange}
    />
  );
}
```

## Related Components

- [EEGChart](./EEGChart.md) - Multi-channel brain wave visualization
- [LiveTelemetryLineChart](./LiveTelemetryLineChart.md) - General-purpose line chart

## Support

For issues or questions:
- GitHub Issues: https://github.com/scadable/library-react/issues
- Documentation: https://github.com/scadable/library-react
