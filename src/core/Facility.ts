
/**
 * Facility class manages the API key for WebSocket connections
 */
export class Facility {

    private readonly apiKey: string;
    private readonly baseUrl = 'wss://stream.scadable.com/ws/live';

    constructor(apiKey: string) {

        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('API key must be a non-empty string');
        }

        this.apiKey = apiKey;
    }

    /**
     * Validate that the facility has a valid API key
     * @returns True if the API key is valid
     */
    isValid(): boolean {
        return this.apiKey.length > 0;
    }


    /**
     * Create a WebSocket connection for a given device ID
     * @param deviceId - The ID of the device to connect to
     * @returns A WebSocket instance
     */
    connect(deviceId: string): WebSocket {

        const url = new URL(this.baseUrl);
        url.searchParams.set('token', this.apiKey);
        url.searchParams.set('deviceid', deviceId);

        return new WebSocket(url.toString());
    }

    /**
     * Get the API key for WebSocket authentication
     * @returns The API key
     */
    getApiKey(): string {
        return this.apiKey;
    }
}
