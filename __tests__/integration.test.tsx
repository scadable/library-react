import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TelemetryDisplay } from '../src/components/TelemetryDisplay';
import {Device, Facility} from "../src";


// WebSocket is mocked in setupTests.ts

describe('Integration Tests', () => {
  it('should render the TelemetryDisplay component with Scadable Stream title', () => {
    const facility = new Facility('test-key');
    const device = new Device(facility, 'test-device');
    render(<TelemetryDisplay device={device} />);
    expect(screen.getByText('Scadable Stream')).toBeInTheDocument();
  });

  it('should show connection status', async () => {
    const facility = new Facility('test-key');
    const device = new Device(facility, 'test-device');
    render(<TelemetryDisplay device={device} />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should show "--" for temperature when no temperature data is available', () => {
    const facility = new Facility('test-key');
    const device = new Device(facility, 'test-device');
    render(<TelemetryDisplay device={device} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('should show "No data received" when no telemetry data is available', () => {
    const facility = new Facility('test-key');
    const device = new Device(facility, 'test-device');
    render(<TelemetryDisplay device={device} />);
    expect(screen.getByText('No data received')).toBeInTheDocument();
  });
});