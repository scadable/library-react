// File: src/components/BasicLineChart.tsx

import React from "react";
// Alias the Recharts LineChart so we can call our wrapper BasicLineChart
import {
    LineChart   as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
    Label,
} from "recharts";
import { DataPoint } from "../services/liveQueryService";
import {ScadableAPIKeyProvider} from "../contexts/ScadableAPIKeyContext";
import {ScadableDeviceIDProvider} from "../contexts/ScadableDeviceIDContext";
import {useLiveQuery} from "../hooks/useLiveQuery";

/**
 * Configuration for a single line chart.
 */
export interface LineChartConfig {
    /** API Key for the user **/
    apiKey?: string;
    /** Device ID to query telemetry from. */
    deviceID?: string;

    /** Key in each data point to use for X axis. */
    xKey: string;
    /** Label/title for the X axis. */
    xLabel: string;
    /** Formatter for X axis ticks. */
    formatX?: (value: any) => string;

    /** Key in each data point to use for Y axis. */
    yKey: string;
    /** Label/title for the Y axis. */
    yLabel: string;
    /** Formatter for Y axis ticks. */
    formatY?: (value: any) => string;

    /** Overall chart title. */
    chartTitle?: string;

    /** Stroke color for the line. */
    color?: string;

    /** Whether to show dots at each point. */
    showDots?: boolean;
}

/**
 * A reusable line‑chart component that you can drop anywhere.
 *
 * @param data    Array of record‑like objects.
 * @param config  Keys, labels, formatters, and styling options.
 */
export const BasicLineChart: React.FC<{
    config: LineChartConfig;
}> = ({ config }) => {
    const {
        xKey,
        xLabel,
        formatX,
        yKey,
        yLabel,
        formatY,
        chartTitle,
        color = "#8884d8",
        showDots = false,
    } = config;

    return (
        <div style={{ width: '100%', height: 400 }}>
            {chartTitle && (
                <h3 style={{ textAlign: 'center', marginBottom: 12 }}>{chartTitle}</h3>
            )}

            <ResponsiveContainer width="100%" height="100%">
                <ScadableAPIKeyProvider initialKey="">
                    <ScadableDeviceIDProvider initialDeviceID={config.deviceID ?? ''}>
                        <RechartsLineChart data={useLiveQuery(60)}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey={xKey}
                                type="number"
                                domain={['auto', 'auto']}
                                tickFormatter={formatX}
                            >
                                <Label value={xLabel} position="insideBottom" offset={-8} />
                            </XAxis>

                            <YAxis dataKey={yKey} tickFormatter={formatY}>
                                <Label value={yLabel} angle={-90} position="insideLeft" offset={10} />
                            </YAxis>

                            <Tooltip
                                labelFormatter={formatX}
                                formatter={(v: any) => (formatY ? formatY(v) : String(v))}
                            />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey={yKey}
                                stroke={color}
                                dot={showDots}
                                isAnimationActive={false}
                            />
                        </RechartsLineChart>
                    </ScadableDeviceIDProvider>
                </ScadableAPIKeyProvider>
            </ResponsiveContainer>
        </div>
    );
};
