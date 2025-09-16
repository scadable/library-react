import { Facility } from './Facility';
import { ConnectionStatus, TelemetryData } from './types';
import { parseMessage } from '../utils/parseMessage';

/**
 * Device class manages device ID and WebSocket connection
 */
export class Device {
  private readonly facility: Facility;
  private readonly deviceId: string;
  private webSocket: WebSocket | null = null;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private messageHandlers: Set<(_data: TelemetryData | string) => void> = new Set();
  private errorHandlers: Set<(_errorMessage: string) => void> = new Set();
  private statusHandlers: Set<(_connectionStatus: ConnectionStatus) => void> = new Set();

  constructor(facility: Facility, deviceId: string) {
    if (!facility || !(facility instanceof Facility)) {
      throw new Error('Facility instance is required');
    }
    if (!deviceId || typeof deviceId !== 'string') {
      throw new Error('Device ID must be a non-empty string');
    }
    if (!facility.isValid()) {
      throw new Error('Facility must have a valid API key');
    }

    this.facility = facility;
    this.deviceId = deviceId;
  }

  /**
   * Get the device ID
   */
  getDeviceId(): string {
    return this.deviceId;
  }

  /**
   * Get the current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Build WebSocket URL with token and device ID parameters
   */
  private buildWebSocketUrl(baseUrl: string = 'wss://api.scadable.com'): string {
    const url = new URL(baseUrl);
    url.searchParams.set('token', this.facility.getApiKey());
    url.searchParams.set('deviceid', this.deviceId);
    return url.toString();
  }

  /**
   * Connect to the WebSocket
   */
  connect(baseUrl?: string): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.updateConnectionStatus(ConnectionStatus.CONNECTING);

    try {
      const wsUrl = this.buildWebSocketUrl(baseUrl);
      this.webSocket = new WebSocket(wsUrl);

      this.webSocket.onopen = () => {
        this.updateConnectionStatus(ConnectionStatus.CONNECTED);
      };

      this.webSocket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.webSocket.onerror = () => {
        this.updateConnectionStatus(ConnectionStatus.ERROR);
        this.notifyErrorHandlers('WebSocket connection error');
      };

      this.webSocket.onclose = () => {
        this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
      };
    } catch (error) {
      this.updateConnectionStatus(ConnectionStatus.ERROR);
      this.notifyErrorHandlers(`Failed to create WebSocket connection: ${error}`);
    }
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
      this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    const parsed = parseMessage(data);
    this.notifyMessageHandlers(parsed);
  }

  /**
   * Update connection status and notify handlers
   */
  private updateConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.statusHandlers.forEach(handler => handler(status));
  }

  /**
   * Notify all message handlers
   */
  private notifyMessageHandlers(data: TelemetryData | string): void {
    this.messageHandlers.forEach(handler => handler(data));
  }

  /**
   * Notify all error handlers
   */
  private notifyErrorHandlers(error: string): void {
    this.errorHandlers.forEach(handler => handler(error));
  }

  /**
   * Subscribe to telemetry messages
   */
  onMessage(handler: (_data: TelemetryData | string) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to connection errors
   */
  onError(handler: (_errorMessage: string) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(handler: (_connectionStatus: ConnectionStatus) => void): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  /**
   * Check if the device is currently connected
   */
  isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED;
  }
}


