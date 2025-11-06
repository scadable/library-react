import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LiveTelemetryLineChart } from './LiveTelemetryLineChart';
import { Device } from '../core/Device';
import { Facility } from '../core/Facility';

// Mock Device for Storybook - same as TelemetryDisplay
class MockDevice extends Device {
  private mockInterval: ReturnType<typeof setInterval> | null = null;

  constructor(facility: Facility, deviceId: string) {
    super(facility, deviceId);
  }

  // Override connect to simulate a connection and data stream
  connect(): void {
    setTimeout(() => {
      (this as any).updateConnectionStatus('connected');

      let temperature = 20;
      this.mockInterval = setInterval(() => {
        temperature += Math.random() * 2 - 1; // Fluctuate temperature
        const mockPayload = {
          broker_id: "service-mqtt-mock-12345",
          device_id: "storybook-device-id",
          payload: "Mw==",
          qos: 0,
          timestamp: new Date().toISOString(),
          topic: "sensors/temperature",
          data: {
            tempreture: parseFloat(temperature.toFixed(2)),
          },
        };
        (this as any).handleMessage(JSON.stringify(mockPayload));
      }, 2000);
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

const meta: Meta<typeof LiveTelemetryLineChart> = {
  title: 'Library/LiveTelemetryLineChart',
  component: LiveTelemetryLineChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A live line chart component that displays real-time telemetry data from a WebSocket connection. Configure JSON paths to extract x and y values from the payload.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof LiveTelemetryLineChart>;

const mockFacility = new Facility('storybook-api-key');
const mockDevice1 = new MockDevice(mockFacility, 'storybook-device-1');
const mockDevice2 = new MockDevice(mockFacility, 'storybook-device-2');
const mockDevice3 = new MockDevice(mockFacility, 'storybook-device-3');

export const TemperatureOverTime: Story = {
  args: {
    device: mockDevice1,
    title: 'Temperature Over Time',
    xAxisLabel: 'Time',
    yAxisLabel: 'Temperature (°C)',
    xDataPath: '.timestamp',
    yDataPath: '.data.tempreture',
    yMin: 0,
    yMax: 50,
    lineColor: '#8884d8',
    maxDataPoints: 20,
    width: 700,
    height: 400,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        This chart uses mock WebSocket data with a FIXED Y-axis (0-50°C). The scale never changes - data just scrolls left.
      </p>
      <LiveTelemetryLineChart {...args} />
    </div>
  ),
};

export const CustomPaths: Story = {
  args: {
    device: mockDevice2,
    title: 'Custom Data Visualization',
    xAxisLabel: 'Timestamp',
    yAxisLabel: 'Value',
    xDataPath: '.timestamp',
    yDataPath: '.data.tempreture',
    yMin: 0,
    yMax: 50,
    lineColor: '#ff7300',
    maxDataPoints: 15,
    width: 600,
    height: 350,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Customize the JSON paths to extract different data from the payload:
      </p>
      <ul style={{ marginBottom: '20px', color: '#666' }}>
        <li><code>xDataPath: ".timestamp"</code> - Extracts timestamp from root</li>
        <li><code>yDataPath: ".data.tempreture"</code> - Extracts temperature from nested data</li>
        <li><code>yMin/yMax: 0/50</code> - Fixed Y-axis range</li>
        <li><code>lineColor: "#ff7300"</code> - Custom orange line color</li>
      </ul>
      <LiveTelemetryLineChart {...args} />
    </div>
  ),
};

export const LargeDataSet: Story = {
  args: {
    device: mockDevice3,
    title: 'Temperature Monitoring',
    xAxisLabel: 'Time',
    yAxisLabel: 'Temperature (°C)',
    xDataPath: '.timestamp',
    yDataPath: '.data.tempreture',
    yMin: 0,
    yMax: 50,
    lineColor: '#82ca9d',
    maxDataPoints: 50,
    width: 800,
    height: 450,
  },
};