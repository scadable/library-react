// File: src/services/LiveQueryService.ts

/**
 * A JSON value: can be string, number, boolean, null,
 * array of JSONValues, or object whose values are JSONValues.
 */
export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

/** Any JSON is allowed as a DataPoint */
export type DataPoint = JSONValue;


export class LiveQueryService {

    private readonly WS_BASE = "wss://socket.scadable.com";
    private ws: WebSocket | null = null;

    constructor(
        private authToken: string,
        private deviceId: string
    ) {}

    /**
     * Subscribe to telemetry for this.deviceId.
     * If authToken is non-empty (after trimming), include it in the query string.
     * Otherwise only send the subject.
     */
    public subscribeToLiveQuery(
        dataHook: (dp: DataPoint) => void,
        onError?: (err: Event) => void
    ): void {

        // Tear down any prior connection
        if (this.ws) {
            this.ws.close();
        }

        const subject = encodeURIComponent(`devices.${this.deviceId}.telemetry`);
        let url = `${this.WS_BASE}/?subject=${subject}`;

        // Only append token if it's not empty (after trimming)
        if (this.authToken.trim() !== "") {
            const token = encodeURIComponent(this.authToken);
            url += `&token=${token}`;
        }

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log("WebSocket connected:", url);
        };

        this.ws.onmessage = (evt) => {
            let payload: unknown;
            try {
                payload = JSON.parse(evt.data);
            } catch {
                // If it isn't JSON, pass the raw data
                payload = evt.data;
            }
            // payload is JSONValue or string; TypeScript will allow it as DataPoint
            dataHook(payload as DataPoint);
        };

        this.ws.onerror = (err) => {
            console.error("WebSocket error:", err);
            onError?.(err);
        };

        this.ws.onclose = (evt) => {
            console.log("WebSocket closed:", evt.code, evt.reason);
        };
    }

    /** Close the socket. */
    public unsubscribe() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
