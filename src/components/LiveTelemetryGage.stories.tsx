import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LiveTelemetryGage } from './LiveTelemetryGage';
import { Device } from '../core/Device';
import { Facility } from '../core/Facility';

// Mock Device for Storybook
class MockDevice extends Device {
  private mockInterval: ReturnType<typeof setInterval> | null = null;
  private dataGenerator: () => number;

  constructor(facility: Facility, deviceId: string, dataGenerator: () => number) {
    super(facility, deviceId);
    this.dataGenerator = dataGenerator;
  }

  // Override connect to simulate a connection and data stream
  connect(): void {
    setTimeout(() => {
      (this as any).updateConnectionStatus('connected');

      let value = this.dataGenerator();
      this.mockInterval = setInterval(() => {
        value = this.dataGenerator();
        const mockPayload = {
          broker_id: "service-mqtt-mock-12345",
          device_id: "storybook-device-id",
          payload: "Mw==",
          qos: 0,
          timestamp: new Date().toISOString(),
          topic: "sensors/data",
          data: {
            temperature: parseFloat(value.toFixed(2)),
            pressure: parseFloat((value * 2.5).toFixed(1)),
            rpm: Math.floor(value * 100),
          },
        };
        (this as any).handleMessage(JSON.stringify(mockPayload));
      }, 1500);
    }, 1000);
  }

  // Override disconnect to clear the interval
  disconnect(): void {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
    }
    (this as any).updateConnectionStatus('disconnected');
  }
}

const meta: Meta<typeof LiveTelemetryGage> = {
  title: 'Basic/LiveTelemetryGage',
  component: LiveTelemetryGage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A modern, animated gauge component that displays real-time telemetry data from a WebSocket connection. Configure JSON paths to extract values and set min/max ranges for the gauge scale.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof LiveTelemetryGage>;

const mockFacility = new Facility('storybook-api-key');

// Temperature generator (15-35°C)
const mockDeviceTemp = new MockDevice(
  mockFacility,
  'storybook-temp-device',
  () => 15 + Math.random() * 20
);

// Pressure generator (0-150 PSI)
const mockDevicePressure = new MockDevice(
  mockFacility,
  'storybook-pressure-device',
  () => Math.random() * 150
);

// RPM generator (0-8000)
const mockDeviceRPM = new MockDevice(
  mockFacility,
  'storybook-rpm-device',
  () => 1000 + Math.random() * 7000
);

// High value generator (danger zone)
const mockDeviceHigh = new MockDevice(
  mockFacility,
  'storybook-high-device',
  () => 70 + Math.random() * 25
);

export const TemperatureGauge: Story = {
  args: {
    device: mockDeviceTemp,
    title: 'Engine Temperature',
    dataPath: '.data.temperature',
    min: 0,
    max: 50,
    unit: '°C',
    decimals: 1,
    size: 300,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666', maxWidth: '300px' }}>
        A circular gauge showing temperature with smooth color transitions from green (cool) to yellow (warm) to red (hot).
      </p>
      <LiveTelemetryGage {...args} />
    </div>
  ),
};

export const PressureGauge: Story = {
  args: {
    device: mockDevicePressure,
    title: 'System Pressure',
    dataPath: '.data.pressure',
    min: 0,
    max: 200,
    unit: 'PSI',
    decimals: 0,
    size: 320,
    colorLow: '#3b82f6',  // Blue for low pressure
    colorMid: '#8b5cf6',  // Purple for medium
    colorHigh: '#ec4899', // Pink for high
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666', maxWidth: '320px' }}>
        Pressure gauge with custom color scheme (blue → purple → pink) and PSI units.
      </p>
      <LiveTelemetryGage {...args} />
    </div>
  ),
};

export const RPMGauge: Story = {
  args: {
    device: mockDeviceRPM,
    title: 'Engine RPM',
    dataPath: '.data.rpm',
    min: 0,
    max: 10000,
    unit: 'RPM',
    decimals: 0,
    size: 350,
    colorLow: '#10b981',  // Emerald
    colorMid: '#f59e0b',  // Amber
    colorHigh: '#dc2626', // Red
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666', maxWidth: '350px' }}>
        RPM gauge with integer values (no decimals) and larger size. Ideal for monitoring engine or motor speed.
      </p>
      <LiveTelemetryGage {...args} />
    </div>
  ),
};

export const DangerZone: Story = {
  args: {
    device: mockDeviceHigh,
    title: 'Critical Temperature',
    dataPath: '.data.temperature',
    min: 0,
    max: 100,
    unit: '°C',
    decimals: 1,
    size: 280,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666', maxWidth: '280px' }}>
        This gauge shows values in the high range (danger zone) with red coloring to indicate critical levels.
      </p>
      <LiveTelemetryGage {...args} />
    </div>
  ),
};

export const MultipleGauges: Story = {
  render: () => {
    const facility = new Facility('storybook-api-key');
    const tempDevice = new MockDevice(facility, 'temp', () => 15 + Math.random() * 20);
    const pressureDevice = new MockDevice(facility, 'pressure', () => Math.random() * 150);
    const rpmDevice = new MockDevice(facility, 'rpm', () => 1000 + Math.random() * 7000);

    return (
      <div>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Multiple gauges can be displayed side by side for comprehensive monitoring dashboards.
        </p>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <LiveTelemetryGage
            device={tempDevice}
            title="Temperature"
            dataPath=".data.temperature"
            min={0}
            max={50}
            unit="°C"
            size={250}
          />
          <LiveTelemetryGage
            device={pressureDevice}
            title="Pressure"
            dataPath=".data.pressure"
            min={0}
            max={200}
            unit="PSI"
            decimals={0}
            size={250}
            colorLow="#3b82f6"
            colorMid="#8b5cf6"
            colorHigh="#ec4899"
          />
          <LiveTelemetryGage
            device={rpmDevice}
            title="RPM"
            dataPath=".data.rpm"
            min={0}
            max={10000}
            unit="RPM"
            decimals={0}
            size={250}
          />
        </div>
      </div>
    );
  },
};

export const CompactGauge: Story = {
  args: {
    device: mockDeviceTemp,
    title: 'Temp',
    dataPath: '.data.temperature',
    min: 0,
    max: 50,
    unit: '°C',
    decimals: 1,
    size: 200,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666', maxWidth: '200px' }}>
        Compact version (200px) perfect for dashboards with space constraints.
      </p>
      <LiveTelemetryGage {...args} />
    </div>
  ),
};
