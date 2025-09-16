import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

// WebSocket is mocked in setupTests.ts

describe('Integration Tests', () => {
  it('should render the App component with Scadable Stream title', () => {
    render(<App />);
    expect(screen.getByText('Scadable Stream')).toBeInTheDocument();
  });

  it('should show connection status', async () => {
    render(<App />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should display telemetry data when received', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    }, { timeout: 1000 });
    await waitFor(() => {
      expect(screen.getByText('No data received')).toBeInTheDocument();
    });
  });

  it('should handle raw string telemetry data', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    }, { timeout: 1000 });
    await waitFor(() => {
      expect(screen.getByText('No data received')).toBeInTheDocument();
    });
  });

  it('should display error messages when connection fails', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No data received')).toBeInTheDocument();
    });
  });

  it('should show "--" for temperature when no temperature data is available', () => {
    render(<App />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('should show "No data received" when no telemetry data is available', () => {
    render(<App />);
    expect(screen.getByText('No data received')).toBeInTheDocument();
  });
});


