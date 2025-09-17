import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TelemetryDisplay } from './TelemetryDisplay';
import {Device} from "../core/Device";
import {Facility} from "../core/Facility";

// Mock Device for Storybook
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
                const mockData = {
                    temperature: parseFloat(temperature.toFixed(2)),
                    timestamp: new Date().toISOString(),
                };
                (this as any).handleMessage(JSON.stringify(mockData));
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

const meta: Meta<typeof TelemetryDisplay> = {
    title: 'Library/TelemetryDisplay',
    component: TelemetryDisplay,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TelemetryDisplay>;

const facility = new Facility('storybook-api-key');
const device = new MockDevice(facility, 'storybook-device-id');

export const Default: Story = {
    args: {
        device: device,
    },
    render: (args) => (
        <div>
            <p>This component uses a mock `Device` to simulate a live data stream.</p>
            <TelemetryDisplay {...args} />
        </div>
    ),
};