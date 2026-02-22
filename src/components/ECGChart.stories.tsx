import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ECGChart } from './ECGChart';
import { Device } from '../core/Device';
import { Facility } from '../core/Facility';

// Mock ECG Device that generates realistic ECG waveform with P-QRS-T pattern
class MockECGDevice extends Device {
  private mockInterval: ReturnType<typeof setInterval> | null = null;
  private sampleIndex: number = 0;
  private heartRate: number = 75; // BPM

  constructor(facility: Facility, deviceId: string, heartRate: number = 75) {
    super(facility, deviceId);
    this.heartRate = heartRate;
  }

  // Generate realistic ECG waveform (P-QRS-T pattern)
  private generateECGValue(): number {
    const samplesPerBeat = (60 / this.heartRate) * 250; // 250 Hz sampling
    const position = (this.sampleIndex % samplesPerBeat) / samplesPerBeat;

    let value = 0;

    // P wave (atrial depolarization) - small bump at ~0.15
    if (position >= 0.12 && position <= 0.18) {
      const pPosition = (position - 0.12) / 0.06;
      value += 0.15 * Math.sin(pPosition * Math.PI);
    }

    // QRS complex (ventricular depolarization) - sharp spike at ~0.35
    if (position >= 0.32 && position <= 0.42) {
      const qrsPosition = (position - 0.32) / 0.1;
      if (qrsPosition < 0.2) {
        // Q wave (small dip)
        value += -0.1 * Math.sin(qrsPosition * 5 * Math.PI);
      } else if (qrsPosition < 0.6) {
        // R wave (tall spike)
        value += 1.2 * Math.sin((qrsPosition - 0.2) * 2.5 * Math.PI);
      } else {
        // S wave (small dip)
        value += -0.15 * Math.sin((qrsPosition - 0.6) * 2.5 * Math.PI);
      }
    }

    // T wave (ventricular repolarization) - rounded bump at ~0.6
    if (position >= 0.52 && position <= 0.68) {
      const tPosition = (position - 0.52) / 0.16;
      value += 0.25 * Math.sin(tPosition * Math.PI);
    }

    // Add small baseline noise
    value += (Math.random() - 0.5) * 0.02;

    this.sampleIndex++;
    return value;
  }

  connect(): void {
    setTimeout(() => {
      (this as any).updateConnectionStatus('connected');

      // Send ECG data at 250 Hz (4ms intervals)
      this.mockInterval = setInterval(() => {
        const ecgValue = this.generateECGValue();
        const mockPayload = {
          broker_id: "service-mqtt-mock-ecg",
          device_id: this.deviceId,
          payload: "ecg",
          qos: 0,
          timestamp: new Date().toISOString(),
          topic: "health/ecg",
          data: {
            ecg: parseFloat(ecgValue.toFixed(3)),
          },
        };
        (this as any).handleMessage(JSON.stringify(mockPayload));
      }, 4); // 4ms = 250 Hz
    }, 500);
  }

  disconnect(): void {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
    }
    (this as any).updateConnectionStatus('disconnected');
  }
}

const meta: Meta<typeof ECGChart> = {
  title: 'Health/ECGChart',
  component: ECGChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Real-time ECG (electrocardiogram) visualization component with medical-standard grid and heart rate calculation. Displays P-QRS-T waveform pattern with customizable colors and settings.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ECGChart>;

const mockFacility = new Facility('storybook-api-key');
const mockDevice1 = new MockECGDevice(mockFacility, 'ecg-device-1', 75);
const mockDevice2 = new MockECGDevice(mockFacility, 'ecg-device-2', 90);
const mockDevice3 = new MockECGDevice(mockFacility, 'ecg-device-3', 60);

export const StandardECG: Story = {
  args: {
    device: mockDevice1,
    title: 'ECG Monitor - Standard Settings',
    dataPath: '.data.ecg',
    mode: 'realtime',
    sweepSpeed: 25,
    gain: 10,
    samplingRate: 250,
    showGrid: true,
    showCalibration: true,
    showHeartRate: true,
    width: 800,
    height: 400,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Standard ECG display with 25mm/s sweep speed and 10mm/mV gain. Watch the realistic P-QRS-T waveform pattern and live heart rate calculation.
      </p>
      <ECGChart {...args} />
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <h4 style={{ marginTop: 0 }}>ECG Waveform Components:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>P wave:</strong> Atrial depolarization (small bump before main spike)</li>
          <li><strong>QRS complex:</strong> Ventricular depolarization (sharp tall spike)</li>
          <li><strong>T wave:</strong> Ventricular repolarization (rounded bump after spike)</li>
        </ul>
      </div>
    </div>
  ),
};

export const HighSpeedECG: Story = {
  args: {
    device: mockDevice2,
    title: 'ECG Monitor - High Speed',
    dataPath: '.data.ecg',
    mode: 'realtime',
    sweepSpeed: 50,
    gain: 10,
    samplingRate: 250,
    showGrid: true,
    showCalibration: true,
    showHeartRate: true,
    width: 800,
    height: 400,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        High-speed ECG display with 50mm/s sweep for detailed waveform analysis. Heart rate: ~90 BPM.
      </p>
      <ECGChart {...args} />
    </div>
  ),
};

export const CustomColors: Story = {
  args: {
    device: mockDevice3,
    title: 'ECG Monitor - Custom Theme',
    dataPath: '.data.ecg',
    mode: 'realtime',
    sweepSpeed: 25,
    gain: 10,
    samplingRate: 250,
    showGrid: true,
    showCalibration: true,
    showHeartRate: true,
    waveformColor: '#3b82f6',
    gridColor: '#93c5fd',
    backgroundColor: '#eff6ff',
    width: 800,
    height: 400,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Custom blue color scheme demonstrating full color customization. Heart rate: ~60 BPM (normal resting).
      </p>
      <ECGChart {...args} />
    </div>
  ),
};

export const DarkModeECG: Story = {
  args: {
    device: new MockECGDevice(mockFacility, 'ecg-device-dark', 75),
    title: 'ECG Monitor - Dark Mode',
    dataPath: '.data.ecg',
    mode: 'realtime',
    sweepSpeed: 25,
    gain: 10,
    samplingRate: 250,
    showGrid: true,
    showCalibration: true,
    showHeartRate: true,
    waveformColor: '#22c55e',
    gridColor: '#374151',
    backgroundColor: '#1f2937',
    width: 800,
    height: 400,
  },
  render: (args) => (
    <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '8px' }}>
      <p style={{ marginBottom: '20px', color: '#9ca3af' }}>
        Dark mode ECG display with green waveform - perfect for low-light environments.
      </p>
      <ECGChart {...args} />
    </div>
  ),
};

export const HighGainECG: Story = {
  args: {
    device: new MockECGDevice(mockFacility, 'ecg-device-highgain', 75),
    title: 'ECG Monitor - High Gain',
    dataPath: '.data.ecg',
    mode: 'realtime',
    sweepSpeed: 25,
    gain: 20,
    samplingRate: 250,
    showGrid: true,
    showCalibration: true,
    showHeartRate: true,
    width: 800,
    height: 400,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        High gain (20mm/mV) for amplifying small signals. Notice the larger waveform amplitude and calibration pulse.
      </p>
      <ECGChart {...args} />
    </div>
  ),
};

export const MultipleECGMonitors: Story = {
  render: () => {
    const device1 = new MockECGDevice(mockFacility, 'ecg-multi-1', 75);
    const device2 = new MockECGDevice(mockFacility, 'ecg-multi-2', 85);

    return (
      <div>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Multiple ECG monitors displaying different patients simultaneously.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          <ECGChart
            device={device1}
            title="Patient 1 - ECG"
            dataPath=".data.ecg"
            width={700}
            height={300}
            showHeartRate={true}
          />
          <ECGChart
            device={device2}
            title="Patient 2 - ECG"
            dataPath=".data.ecg"
            width={700}
            height={300}
            showHeartRate={true}
            waveformColor="#f59e0b"
            gridColor="#fde68a"
          />
        </div>
      </div>
    );
  },
};
