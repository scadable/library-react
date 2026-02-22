# EEGChart Component

A real-time electroencephalogram (EEG) visualization component for multi-channel brain wave monitoring with optional spectral analysis and customizable display modes.

## Medical Context

An **EEG (Electroencephalogram)** records electrical activity in the brain using multiple electrodes placed on the scalp. EEG is used to:

- Diagnose epilepsy and seizure disorders
- Study sleep patterns and disorders
- Monitor brain activity during surgery
- Research cognitive processes and brain states
- Detect brain injuries and abnormalities

### Frequency Bands

Brain waves are categorized into five main frequency bands:

| Band | Frequency | Mental State |
|------|-----------|--------------|
| **Delta (δ)** | 0.5-4 Hz | Deep sleep, unconscious |
| **Theta (θ)** | 4-8 Hz | Drowsiness, meditation, creativity |
| **Alpha (α)** | 8-13 Hz | Relaxed, calm, awake |
| **Beta (β)** | 13-30 Hz | Active thinking, concentration, alertness |
| **Gamma (γ)** | 30-100 Hz | High-level information processing |

## Installation

```bash
npm install scadable
```

## Import

```typescript
import { EEGChart, EEGChannelConfig } from 'scadable/health';
```

## Basic Usage

### Real-time 4-Channel EEG

```tsx
import { EEGChart, EEGChannelConfig } from 'scadable/health';

function MyComponent() {
  const channels: EEGChannelConfig[] = [
    { name: 'Fp1', dataPath: '.data.channels.Fp1', color: '#3b82f6' },
    { name: 'Fp2', dataPath: '.data.channels.Fp2', color: '#10b981' },
    { name: 'C3', dataPath: '.data.channels.C3', color: '#f59e0b' },
    { name: 'C4', dataPath: '.data.channels.C4', color: '#ef4444' },
  ];

  return (
    <EEGChart
      apiKey="your-api-key"
      deviceId="eeg-device-001"
      channels={channels}
      title="EEG Monitor"
      layout="stacked"
      showLabels={true}
    />
  );
}
```

### With Spectral Analysis

```tsx
import { EEGChart, EEGChannelConfig } from 'scadable/health';

function MyComponent() {
  const channels: EEGChannelConfig[] = [
    { name: 'Fp1', dataPath: '.data.channels.Fp1', color: '#3b82f6' },
    { name: 'Fp2', dataPath: '.data.channels.Fp2', color: '#10b981' },
  ];

  return (
    <EEGChart
      apiKey="your-api-key"
      deviceId="eeg-device-001"
      channels={channels}
      showSpectralAnalysis={true}
      frequencyBands={['delta', 'theta', 'alpha', 'beta', 'gamma']}
    />
  );
}
```

### Historical Mode

```tsx
import { EEGChart, EEGChannelConfig } from 'scadable/health';

const channels: EEGChannelConfig[] = [
  { name: 'Fp1', dataPath: '.data.channels.Fp1', color: '#3b82f6' },
  { name: 'Fp2', dataPath: '.data.channels.Fp2', color: '#10b981' },
];

const historicalData = new Map<string, number[]>([
  ['Fp1', [12.5, 15.3, 18.2, ...]],
  ['Fp2', [10.1, 13.8, 16.5, ...]],
]);

function MyComponent() {
  return (
    <EEGChart
      mode="historical"
      channels={channels}
      historicalData={historicalData}
      samplingRate={256}
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
| `channels` | `EEGChannelConfig[]` | Required | Channel configurations (see below) |
| `mode` | `'realtime' \| 'historical'` | `'realtime'` | Display mode |
| `historicalData` | `Map<string, number[]>` | - | Pre-recorded channel data for historical mode |

### Display Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'EEG Monitor'` | Chart title |
| `width` | `number` | `1000` | Chart width in pixels |
| `height` | `number` | `600` | Chart height in pixels |
| `layout` | `'stacked' \| 'overlay'` | `'stacked'` | Channel display layout |
| `showLabels` | `boolean` | `true` | Show channel labels |

### Medical Settings

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sensitivity` | `number` | `70` | Sensitivity in µV/mm (standard: 5-100) |
| `timeWindow` | `number` | `10` | Time window in seconds |
| `samplingRate` | `number` | `256` | Sampling rate in Hz (typical: 256-512) |

### Spectral Analysis

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showSpectralAnalysis` | `boolean` | `false` | Show spectral analysis panel |
| `frequencyBands` | `Array<'delta' \| 'theta' \| 'alpha' \| 'beta' \| 'gamma'>` | All bands | Which frequency bands to analyze |

### Color Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `'#ffffff'` | Background color |
| `gridColor` | `string` | `'#e5e7eb'` | Grid line color |
| `textColor` | `string` | `'#1f2937'` | Text color |

## EEGChannelConfig

```typescript
interface EEGChannelConfig {
  name: string;        // Channel name (e.g., "Fp1", "C3")
  dataPath: string;    // JSON path to extract value
  color: string;       // Channel display color
}
```

## Channel Naming (10-20 System)

The international 10-20 system standardizes electrode placement:

- **Fp**: Frontal pole (Fp1, Fp2)
- **F**: Frontal (F3, F4, F7, F8, Fz)
- **C**: Central (C3, C4, Cz)
- **T**: Temporal (T3, T4, T5, T6)
- **P**: Parietal (P3, P4, Pz)
- **O**: Occipital (O1, O2)

Odd numbers = left hemisphere, Even numbers = right hemisphere, z = midline

## Expected Data Format

The component expects WebSocket data in this format:

```json
{
  "broker_id": "service-mqtt-...",
  "device_id": "eeg-device-001",
  "timestamp": "2025-11-06T19:54:50.802Z",
  "data": {
    "channels": {
      "Fp1": 45.2,
      "Fp2": 42.8,
      "C3": 38.5,
      "C4": 40.1
    }
  }
}
```

Where channel values are in **microvolts (µV)**.

## Layout Modes

### Stacked Layout
- Each channel has its own horizontal baseline
- Easy to identify individual channels
- Best for monitoring multiple channels
- Default and most common mode

```tsx
<EEGChart layout="stacked" showLabels={true} />
```

### Overlay Layout
- All channels share the same baseline
- Easy to compare waveform synchronization
- Useful for correlation analysis
- Better for fewer channels (2-4)

```tsx
<EEGChart layout="overlay" showLabels={false} />
```

## Spectral Analysis

When `showSpectralAnalysis={true}`, the component:
1. Performs FFT (Fast Fourier Transform) on each channel
2. Calculates power in each frequency band
3. Identifies the dominant frequency band
4. Updates analysis every second
5. Displays results in a side panel

### Interpreting Results

```tsx
<EEGChart
  showSpectralAnalysis={true}
  frequencyBands={['alpha', 'beta']} // Only show these bands
/>
```

Example output:
- **High Alpha**: Relaxed, meditative state
- **High Beta**: Active thinking, concentration
- **High Theta**: Drowsy, creative state
- **High Delta**: Deep sleep

## Sensitivity Settings

Sensitivity controls the vertical scale (µV per mm):

| Sensitivity | Use Case |
|-------------|----------|
| **30 µV/mm** | High amplification, small signals |
| **50 µV/mm** | Standard clinical setting |
| **70 µV/mm** | Default, balanced view |
| **100 µV/mm** | Lower amplification, large signals |

```tsx
// High sensitivity for small signals
<EEGChart sensitivity={30} />

// Low sensitivity for large signals
<EEGChart sensitivity={100} />
```

## Color Customization Examples

### Standard Medical
```tsx
<EEGChart
  backgroundColor="#ffffff"
  gridColor="#e5e7eb"
  textColor="#1f2937"
/>
```

### Dark Mode
```tsx
<EEGChart
  backgroundColor="#1f2937"
  gridColor="#374151"
  textColor="#f9fafb"
/>
```

### High Contrast
```tsx
<EEGChart
  backgroundColor="#000000"
  gridColor="#666666"
  textColor="#ffffff"
/>
```

### Per-Channel Colors
```tsx
const channels: EEGChannelConfig[] = [
  { name: 'Fp1', dataPath: '.data.channels.Fp1', color: '#FF0000' },
  { name: 'Fp2', dataPath: '.data.channels.Fp2', color: '#00FF00' },
  { name: 'C3', dataPath: '.data.channels.C3', color: '#0000FF' },
  { name: 'C4', dataPath: '.data.channels.C4', color: '#FFFF00' },
];
```

## Performance

- Supports up to **1024 Hz** sampling rate
- Renders at **60 FPS** using hardware-accelerated Canvas
- Efficiently handles 8+ channels simultaneously
- Memory efficient with per-channel circular buffers
- Spectral analysis runs in background without blocking rendering

## Best Practices

### 1. Choose Appropriate Layout
```tsx
// For 4+ channels, use stacked
<EEGChart layout="stacked" showLabels={true} />

// For 2-3 channels comparison, use overlay
<EEGChart layout="overlay" showLabels={false} />
```

### 2. Configure Sensitivity Based on Signal
```tsx
// For adult scalp EEG (typical 50-100 µV)
<EEGChart sensitivity={70} />

// For pediatric EEG (higher amplitude)
<EEGChart sensitivity={100} />
```

### 3. Use Descriptive Channel Names
```tsx
const channels: EEGChannelConfig[] = [
  { name: 'Left Frontal', dataPath: '.data.channels.Fp1', color: '#3b82f6' },
  { name: 'Right Frontal', dataPath: '.data.channels.Fp2', color: '#10b981' },
];
```

### 4. Responsive Design
```tsx
<EEGChart
  width={Math.min(1200, window.innerWidth - 40)}
  height={window.innerHeight * 0.6}
/>
```

## Common Montages

### Bipolar Montage (Double Banana)
```tsx
const channels: EEGChannelConfig[] = [
  { name: 'Fp1-F3', dataPath: '.data.bipolar.Fp1_F3', color: '#3b82f6' },
  { name: 'F3-C3', dataPath: '.data.bipolar.F3_C3', color: '#10b981' },
  { name: 'C3-P3', dataPath: '.data.bipolar.C3_P3', color: '#f59e0b' },
  { name: 'P3-O1', dataPath: '.data.bipolar.P3_O1', color: '#ef4444' },
];
```

### Referential Montage
```tsx
const channels: EEGChannelConfig[] = [
  { name: 'Fp1-A1', dataPath: '.data.referential.Fp1', color: '#3b82f6' },
  { name: 'Fp2-A2', dataPath: '.data.referential.Fp2', color: '#10b981' },
  { name: 'C3-A1', dataPath: '.data.referential.C3', color: '#f59e0b' },
  { name: 'C4-A2', dataPath: '.data.referential.C4', color: '#ef4444' },
];
```

## Medical Disclaimer

⚠️ **IMPORTANT**: This component is for **visualization purposes only** and is **NOT intended for medical diagnosis or treatment**.

- Do not use for clinical decision-making
- Do not use as a replacement for medical-grade EEG equipment
- Always consult qualified healthcare professionals
- This is educational/demo software, not medical device software
- Not approved by FDA or other regulatory agencies

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support (may have reduced performance with 8+ channels)

Requires:
- HTML5 Canvas support
- ES6+ JavaScript
- WebSocket support (for realtime mode)

## Troubleshooting

### Channels not displaying
- Verify `dataPath` matches your data structure
- Check WebSocket connection (connection indicator)
- Ensure channel values are in microvolts (µV), typically 0-100 range

### Waveforms too small/large
- Adjust `sensitivity` prop (lower = larger waveform)
- Check that values are in µV, not mV or V

### Spectral analysis not updating
- Ensure enough data is collected (need at least 1 second of data)
- Check `samplingRate` matches your actual data rate
- Verify `showSpectralAnalysis={true}` is set

### Poor performance with many channels
- Reduce `samplingRate` if medical precision not required
- Reduce `timeWindow` to use less memory
- Disable `showSpectralAnalysis` if not needed
- Use fewer channels (8 or less recommended)

## Examples

### Sleep Study Monitor
```tsx
import { EEGChart, EEGChannelConfig } from 'scadable/health';

function SleepStudy() {
  const channels: EEGChannelConfig[] = [
    { name: 'C3', dataPath: '.data.channels.C3', color: '#3b82f6' },
    { name: 'C4', dataPath: '.data.channels.C4', color: '#10b981' },
  ];

  return (
    <EEGChart
      apiKey="your-api-key"
      deviceId="sleep-eeg-001"
      channels={channels}
      showSpectralAnalysis={true}
      frequencyBands={['delta', 'theta', 'alpha']}
      timeWindow={30}
      sensitivity={70}
    />
  );
}
```

### Full Clinical Montage
```tsx
function ClinicalEEG() {
  const channels: EEGChannelConfig[] = [
    { name: 'Fp1', dataPath: '.data.channels.Fp1', color: '#3b82f6' },
    { name: 'Fp2', dataPath: '.data.channels.Fp2', color: '#10b981' },
    { name: 'F3', dataPath: '.data.channels.F3', color: '#f59e0b' },
    { name: 'F4', dataPath: '.data.channels.F4', color: '#ef4444' },
    { name: 'C3', dataPath: '.data.channels.C3', color: '#8b5cf6' },
    { name: 'C4', dataPath: '.data.channels.C4', color: '#ec4899' },
    { name: 'P3', dataPath: '.data.channels.P3', color: '#06b6d4' },
    { name: 'P4', dataPath: '.data.channels.P4', color: '#84cc16' },
    { name: 'O1', dataPath: '.data.channels.O1', color: '#f97316' },
    { name: 'O2', dataPath: '.data.channels.O2', color: '#14b8a6' },
  ];

  return (
    <EEGChart
      apiKey="your-api-key"
      deviceId="clinical-eeg-001"
      channels={channels}
      layout="stacked"
      showLabels={true}
      sensitivity={70}
      timeWindow={10}
      width={1200}
      height={900}
    />
  );
}
```

### Meditation Monitor
```tsx
function MeditationMonitor() {
  const channels: EEGChannelConfig[] = [
    { name: 'Fp1', dataPath: '.data.channels.Fp1', color: '#3b82f6' },
  ];

  return (
    <div>
      <h2>Meditation Session</h2>
      <EEGChart
        apiKey="your-api-key"
        deviceId="meditation-eeg"
        channels={channels}
        showSpectralAnalysis={true}
        frequencyBands={['alpha', 'theta']}
        sensitivity={50}
        backgroundColor="#f0fdf4"
        gridColor="#bbf7d0"
      />
      <p>High Alpha = Deep relaxation, High Theta = Meditative state</p>
    </div>
  );
}
```

## Related Components

- [ECGChart](./ECGChart.md) - Heart electrical activity visualization
- [LiveTelemetryLineChart](./LiveTelemetryLineChart.md) - General-purpose line chart

## Support

For issues or questions:
- GitHub Issues: https://github.com/scadable/library-react/issues
- Documentation: https://github.com/scadable/library-react
