/**
 * Facility class manages the API key for WebSocket connections
 */
export class Facility {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key must be a non-empty string');
    }
    this.apiKey = apiKey;
  }

  /**
   * Get the API key for WebSocket authentication
   * @returns The API key
   */
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Validate that the facility has a valid API key
   * @returns True if the API key is valid
   */
  isValid(): boolean {
    return this.apiKey.length > 0;
  }
}


