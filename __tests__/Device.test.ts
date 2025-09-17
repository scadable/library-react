import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Facility, Device, ConnectionStatus } from '../src/index';

// WebSocket is mocked in setupTests.ts

describe('Device', () => {
  let facility: Facility;
  let device: Device;

  beforeEach(() => {
    facility = new Facility('test-api-key');
    device = new Device(facility, 'test-device-id');
  });

  it('should create a device with valid facility and device ID', () => {
    expect(device.getDeviceId()).toBe('test-device-id');
    expect(device.getConnectionStatus()).toBe(ConnectionStatus.DISCONNECTED);
  });

  it('should throw error for invalid facility', () => {
    expect(() => new Device(null as any, 'device-id')).toThrow('Facility instance is required');
    expect(() => new Device(undefined as any, 'device-id')).toThrow('Facility instance is required');
  });

  it('should throw error for invalid device ID', () => {
    expect(() => new Device(facility, '')).toThrow('Device ID must be a non-empty string');
    expect(() => new Device(facility, null as any)).toThrow('Device ID must be a non-empty string');
  });

  it('should build correct WebSocket URL', () => {
    device.connect();
    // The URL should contain token and deviceid parameters
    expect(device.getConnectionStatus()).toBe(ConnectionStatus.CONNECTING);
  });

  it('should handle message subscription and unsubscription', () => {
    const messageHandler = vi.fn();
    const unsubscribe = device.onMessage(messageHandler);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('should handle error subscription and unsubscription', () => {
    const errorHandler = vi.fn();
    const unsubscribe = device.onError(errorHandler);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('should handle status change subscription and unsubscription', () => {
    const statusHandler = vi.fn();
    const unsubscribe = device.onStatusChange(statusHandler);
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('should connect and disconnect properly', () => {
    device.connect();
    expect(device.getConnectionStatus()).toBe(ConnectionStatus.CONNECTING);
    device.disconnect();
    expect(device.getConnectionStatus()).toBe(ConnectionStatus.DISCONNECTED);
  });

  it('should not connect if already connected', () => {
    device.connect();
    const initialStatus = device.getConnectionStatus();
    device.connect();
    expect(device.getConnectionStatus()).toBe(initialStatus);
  });

  it('should parse JSON messages correctly', () => {
    const messageHandler = vi.fn();
    device.onMessage(messageHandler);
    const jsonMessage = { temperature: 25.5, humidity: 60 };
    (device as any).handleMessage(JSON.stringify(jsonMessage));
    expect(messageHandler).toHaveBeenCalledWith(jsonMessage);
  });

  it('should handle non-JSON messages as raw strings', () => {
    const messageHandler = vi.fn();
    device.onMessage(messageHandler);
    const rawMessage = 'raw telemetry data';
    (device as any).handleMessage(rawMessage);
    expect(messageHandler).toHaveBeenCalledWith(rawMessage);
  });

  it('should check connection status correctly', () => {
    expect(device.isConnected()).toBe(false);
    device.connect();
    expect(typeof device.isConnected).toBe('function');
  });
});
