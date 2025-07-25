
//
// /* ---------------- types & helpers ---------------- */

export interface LineChartConfig {
    apiKey?: string;
    deviceID?: string;

    xKey: string;
    xLabel: string;
    formatX?: (v: any) => string;

    yKey: string;
    yLabel: string;
    formatY?: (v: any) => string;

    chartTitle?: string;
    color?: string;
    showDots?: boolean;
}

