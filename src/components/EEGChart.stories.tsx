import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EEGChart, EEGChannelConfig } from './EEGChart';
import { Device } from '../core/Device';
import { Facility } from '../core/Facility';

// Mock EEG Device that generates realistic multi-channel brain wave patterns
class MockEEGDevice extends Device {
  private mockInterval: ReturnType<typeof setInterval> | null = null;
  private sampleIndex: number = 0;
  private channels: string[];

  constructor(facility: Facility, deviceId: string, channels: string[]) {
    super(facility, deviceId);
    this.channels = channels;
  }

  // Generate realistic EEG waveform with different frequency bands
  private generateEEGValue(channelIndex: number, dominantBand: 'alpha' | 'beta' | 'theta' | 'delta' = 'alpha'): number {
    const time = this.sampleIndex / 256; // 256 Hz sampling
    let value = 0;

    // Mix different frequency bands based on dominant band
    switch (dominantBand) {
      case 'alpha': // 8-13 Hz (relaxed, awake)
        value += 30 * Math.sin(2 * Math.PI * 10 * time);
        value += 10 * Math.sin(2 * Math.PI * 5 * time); // Some theta
        break;
      case 'beta': // 13-30 Hz (active thinking)
        value += 20 * Math.sin(2 * Math.PI * 20 * time);
        value += 15 * Math.sin(2 * Math.PI * 25 * time);
        value += 10 * Math.sin(2 * Math.PI * 10 * time); // Some alpha
        break;
      case 'theta': // 4-8 Hz (drowsy, meditative)
        value += 35 * Math.sin(2 * Math.PI * 6 * time);
        value += 15 * Math.sin(2 * Math.PI * 3 * time); // Some delta
        break;
      case 'delta': // 0.5-4 Hz (deep sleep)
        value += 40 * Math.sin(2 * Math.PI * 2 * time);
        value += 20 * Math.sin(2 * Math.PI * 1 * time);
        break;
    }

    // Add channel-specific phase offset
    value += 5 * Math.sin(2 * Math.PI * 15 * time + channelIndex);

    // Add small noise
    value += (Math.random() - 0.5) * 3;

    return value;
  }

  connect(): void {
    setTimeout(() => {
      (this as any).updateConnectionStatus('connected');

      // Send EEG data at 256 Hz (~4ms intervals)
      this.mockInterval = setInterval(() => {
        const channelData: any = {};

        this.channels.forEach((channel, index) => {
          // Different channels have different dominant frequencies
          let dominantBand: 'alpha' | 'beta' | 'theta' | 'delta' = 'alpha';
          if (index % 4 === 0) dominantBand = 'alpha';
          else if (index % 4 === 1) dominantBand = 'beta';
          else if (index % 4 === 2) dominantBand = 'theta';
          else dominantBand = 'alpha';

          channelData[channel] = parseFloat(this.generateEEGValue(index, dominantBand).toFixed(2));
        });

        const mockPayload = {
          broker_id: "service-mqtt-mock-eeg",
          device_id: this.deviceId,
          payload: "eeg",
          qos: 0,
          timestamp: new Date().toISOString(),
          topic: "health/eeg",
          data: {
            channels: channelData,
          },
        };

        (this as any).handleMessage(JSON.stringify(mockPayload));
        this.sampleIndex++;
      }, 4); // ~256 Hz
    }, 500);
  }

  disconnect(): void {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
    }
    (this as any).updateConnectionStatus('disconnected');
  }
}

const meta: Meta<typeof EEGChart> = {
  title: 'Health/EEGChart',
  component: EEGChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Real-time EEG (electroencephalogram) visualization component for multi-channel brain wave monitoring. Supports stacked and overlay layouts with optional spectral analysis.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof EEGChart>;

const mockFacility = new Facility('storybook-api-key');

// 4-channel configuration
const channels4: EEGChannelConfig[] = [
  { name: 'Fp1', dataPath: '.data.channels.Fp1', color: '#3b82f6' },
  { name: 'Fp2', dataPath: '.data.channels.Fp2', color: '#10b981' },
  { name: 'C3', dataPath: '.data.channels.C3', color: '#f59e0b' },
  { name: 'C4', dataPath: '.data.channels.C4', color: '#ef4444' },
];

const mockDevice4 = new MockEEGDevice(mockFacility, 'eeg-device-4ch', ['Fp1', 'Fp2', 'C3', 'C4']);

export const StandardEEG: Story = {
  args: {
    device: mockDevice4,
    title: 'EEG Monitor - 4 Channels',
    channels: channels4,
    mode: 'realtime',
    sensitivity: 70,
    timeWindow: 10,
    samplingRate: 256,
    layout: 'stacked',
    showLabels: true,
    width: 1000,
    height: 600,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Standard 4-channel EEG display in stacked layout. Each channel shows different brain wave patterns.
      </p>
      <EEGChart {...args} />
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <h4 style={{ marginTop: 0 }}>EEG Frequency Bands:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Delta (δ):</strong> 0.5-4 Hz - Deep sleep</li>
          <li><strong>Theta (θ):</strong> 4-8 Hz - Drowsiness, meditation</li>
          <li><strong>Alpha (α):</strong> 8-13 Hz - Relaxed, awake</li>
          <li><strong>Beta (β):</strong> 13-30 Hz - Active thinking, concentration</li>
          <li><strong>Gamma (γ):</strong> 30-100 Hz - High-level information processing</li>
        </ul>
      </div>
    </div>
  ),
};

export const WithSpectralAnalysis: Story = {
  args: {
    device: new MockEEGDevice(mockFacility, 'eeg-device-spectral', ['Fp1', 'Fp2', 'C3', 'C4']),
    title: 'EEG Monitor - With Spectral Analysis',
    channels: channels4,
    mode: 'realtime',
    sensitivity: 70,
    timeWindow: 10,
    samplingRate: 256,
    layout: 'stacked',
    showLabels: true,
    showSpectralAnalysis: true,
    frequencyBands: ['delta', 'theta', 'alpha', 'beta', 'gamma'],
    width: 1000,
    height: 600,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        EEG display with real-time spectral analysis showing power in each frequency band. The dominant band is highlighted for each channel.
      </p>
      <EEGChart {...args} />
    </div>
  ),
};

// 8-channel configuration
const channels8: EEGChannelConfig[] = [
  { name: 'Fp1', dataPath: '.data.channels.Fp1', color: '#3b82f6' },
  { name: 'Fp2', dataPath: '.data.channels.Fp2', color: '#10b981' },
  { name: 'F3', dataPath: '.data.channels.F3', color: '#f59e0b' },
  { name: 'F4', dataPath: '.data.channels.F4', color: '#ef4444' },
  { name: 'C3', dataPath: '.data.channels.C3', color: '#8b5cf6' },
  { name: 'C4', dataPath: '.data.channels.C4', color: '#ec4899' },
  { name: 'P3', dataPath: '.data.channels.P3', color: '#06b6d4' },
  { name: 'P4', dataPath: '.data.channels.P4', color: '#84cc16' },
];

const mockDevice8 = new MockEEGDevice(mockFacility, 'eeg-device-8ch', ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4']);

export const FullMontage: Story = {
  args: {
    device: mockDevice8,
    title: 'EEG Monitor - 8 Channel Montage',
    channels: channels8,
    mode: 'realtime',
    sensitivity: 70,
    timeWindow: 10,
    samplingRate: 256,
    layout: 'stacked',
    showLabels: true,
    width: 1000,
    height: 800,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Full 8-channel EEG montage showing frontal (Fp), frontocentral (F), central (C), and parietal (P) electrode positions.
      </p>
      <EEGChart {...args} />
    </div>
  ),
};

export const OverlayMode: Story = {
  args: {
    device: new MockEEGDevice(mockFacility, 'eeg-device-overlay', ['Fp1', 'Fp2', 'C3', 'C4']),
    title: 'EEG Monitor - Overlay Mode',
    channels: channels4,
    mode: 'realtime',
    sensitivity: 70,
    timeWindow: 10,
    samplingRate: 256,
    layout: 'overlay',
    showLabels: false,
    width: 1000,
    height: 500,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Overlay mode displays all channels on the same baseline for easy comparison of waveform synchronization.
      </p>
      <EEGChart {...args} />
    </div>
  ),
};

export const DarkModeEEG: Story = {
  args: {
    device: new MockEEGDevice(mockFacility, 'eeg-device-dark', ['Fp1', 'Fp2', 'C3', 'C4']),
    title: 'EEG Monitor - Dark Mode',
    channels: channels4,
    mode: 'realtime',
    sensitivity: 70,
    timeWindow: 10,
    samplingRate: 256,
    layout: 'stacked',
    showLabels: true,
    backgroundColor: '#1f2937',
    gridColor: '#374151',
    textColor: '#f9fafb',
    width: 1000,
    height: 600,
  },
  render: (args) => (
    <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '8px' }}>
      <p style={{ marginBottom: '20px', color: '#9ca3af' }}>
        Dark mode EEG display with custom color scheme for low-light environments.
      </p>
      <EEGChart {...args} />
    </div>
  ),
};

export const HighSensitivity: Story = {
  args: {
    device: new MockEEGDevice(mockFacility, 'eeg-device-highsens', ['Fp1', 'Fp2', 'C3', 'C4']),
    title: 'EEG Monitor - High Sensitivity',
    channels: channels4,
    mode: 'realtime',
    sensitivity: 30,
    timeWindow: 10,
    samplingRate: 256,
    layout: 'stacked',
    showLabels: true,
    width: 1000,
    height: 600,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        High sensitivity (30 µV/mm) amplifies the signal for detecting small variations in brain activity.
      </p>
      <EEGChart {...args} />
    </div>
  ),
};

export const LongTimeWindow: Story = {
  args: {
    device: new MockEEGDevice(mockFacility, 'eeg-device-longtime', ['Fp1', 'Fp2', 'C3', 'C4']),
    title: 'EEG Monitor - Extended View',
    channels: channels4,
    mode: 'realtime',
    sensitivity: 70,
    timeWindow: 20,
    samplingRate: 256,
    layout: 'stacked',
    showLabels: true,
    width: 1200,
    height: 600,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Extended 20-second time window for observing longer-term brain wave patterns and trends.
      </p>
      <EEGChart {...args} />
    </div>
  ),
};
