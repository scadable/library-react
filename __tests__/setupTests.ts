import '@testing-library/jest-dom';

// Mock WebSocket globally
class MockWebSocket {
  // Define static properties to avoid relying on the global WebSocket object
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState: number = MockWebSocket.CONNECTING;
  public onopen: ((_event: Event) => void) | null = null;
  public onmessage: ((_event: MessageEvent) => void) | null = null;
  public onerror: ((_event: Event) => void) | null = null;
  public onclose: ((_event: CloseEvent) => void) | null = null;
  public url: string;

  constructor(url: string) {
    this.url = url;
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN; // Use the static property
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED; // Use the static property
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  send() {
    // No-op for this mock
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any;

// Mock Event classes
global.Event = class Event {
  constructor(type: string) {
    // @ts-ignore
    this.type = type;
  }
} as any;
global.MessageEvent = class MessageEvent extends Event {} as any;
global.CloseEvent = class CloseEvent extends Event {} as any;