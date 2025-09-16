import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Facility, Device, useLiveTelemetry, ConnectionStatus } from '../src/index';

// WebSocket is mocked in setupTests.ts

describe('useLiveTelemetry', () => {
  let facility: Facility;
  let device: Device;

  beforeEach(() => {
    facility = new Facility('test-api-key');
    device = new Device(facility, 'test-device-id');
  });

  it('should initialize with null telemetry and disconnected state', () => {
    const { result } = renderHook(() => useLiveTelemetry(device));
    expect(result.current.telemetry).toBe(null);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle device connection and status updates', async () => {
    const { result } = renderHook(() => useLiveTelemetry(device));
    expect(result.current.isConnected).toBe(false);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle telemetry message updates', async () => {
    const { result } = renderHook(() => useLiveTelemetry(device));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    const testData = { temperature: 25.5, humidity: 60 };
    await act(() => {
      (device as any).handleMessage(JSON.stringify(testData));
    });
    expect(result.current.telemetry).toEqual(testData);
  });

  it('should handle raw string messages', async () => {
    const { result } = renderHook(() => useLiveTelemetry(device));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    const rawMessage = 'raw telemetry data';
    await act(() => {
      (device as any).handleMessage(rawMessage);
    });
    expect(result.current.telemetry).toBe(rawMessage);
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() => useLiveTelemetry(device));
    await act(() => {
      (device as any).notifyErrorHandlers('Connection failed');
    });
    expect(result.current.error).toBe('Connection failed');
  });

  it('should clear errors on successful message', async () => {
    const { result } = renderHook(() => useLiveTelemetry(device));
    await act(() => {
      (device as any).notifyErrorHandlers('Connection failed');
    });
    expect(result.current.error).toBe('Connection failed');
    await act(() => {
      (device as any).handleMessage(JSON.stringify({ temperature: 25 }));
    });
    expect(result.current.error).toBe(null);
  });

  it('should handle device disconnection on unmount', () => {
    const disconnectSpy = vi.spyOn(device, 'disconnect');
    const { unmount } = renderHook(() => useLiveTelemetry(device));
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should handle invalid device gracefully', () => {
    const { result } = renderHook(() => useLiveTelemetry(null as any));
    expect(result.current.error).toBe('Device instance is required');
  });

  it('should update connection status when device status changes', async () => {
    const { result } = renderHook(() => useLiveTelemetry(device));
    expect(result.current.isConnected).toBe(false);
    await act(() => {
      (device as any).updateConnectionStatus(ConnectionStatus.CONNECTED);
    });
    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle multiple message updates', async () => {
    const { result } = renderHook(() => useLiveTelemetry(device));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    await act(() => {
      (device as any).handleMessage(JSON.stringify({ temperature: 20 }));
    });
    expect(result.current.telemetry).toEqual({ temperature: 20 });
    await act(() => {
      (device as any).handleMessage(JSON.stringify({ temperature: 25, humidity: 60 }));
    });
    expect(result.current.telemetry).toEqual({ temperature: 25, humidity: 60 });
  });
});


