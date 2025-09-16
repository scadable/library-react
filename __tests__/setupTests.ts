import '@testing-library/jest-dom';

// Mock WebSocket globally
class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((_event: Event) => void) | null = null;
  public onmessage: ((_event: MessageEvent) => void) | null = null;
  public onerror: ((_event: Event) => void) | null = null;
  public onclose: ((_event: CloseEvent) => void) | null = null;
  public url: string;

  constructor(url: string) {
    this.url = url;
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any;

// Mock CloseEvent
global.CloseEvent = class CloseEvent extends Event {
  constructor(type: string) {
    super(type);
  }
} as any;


