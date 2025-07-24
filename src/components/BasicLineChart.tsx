// Completely rewired to use Chart.js instead of Recharts

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Tooltip,
    Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

import {
    ScadableAPIKeyProvider,
} from '../contexts/ScadableAPIKeyContext';
import {
    ScadableDeviceIDProvider,
} from '../contexts/ScadableDeviceIDContext';
import { useLiveQuery } from '../hooks/useLiveQuery';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend);

/* ---------------- types & helpers ---------------- */

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

/** Support dot-notation such as "data.temp" */
function getNested(obj: any, path: string) {
    const val = path.split('.').reduce((acc, key) => acc?.[key], obj);

    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        // ISO string → trim to 3 decimals max before the Z
        return val.replace(/\.(\d{3})\d*Z$/, '.$1Z');
    }
    return val;
}

/* ---------------- Inner chart body ---------------- */

const ChartBody: React.FC<{ config: LineChartConfig }> = ({ config }) => {
    const raw = useLiveQuery(120);       // live feed
    const {
        xKey,
        yKey,
        xLabel,
        yLabel,
        formatX,
        formatY,
        color = '#3f51b5',
        showDots = true,
        chartTitle,
    } = config;

    // Transform to Chart.js “{x, y}” points
    const points = raw.map(pt => ({
        x: getNested(pt, xKey),
        y: getNested(pt, yKey),
    }));

    const data = {
        datasets: [
            {
                label: yLabel,
                data: points,
                borderColor: color,
                backgroundColor: color,
                pointRadius: showDots ? 3 : 0,
                tension: 0.3,
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,          // we already supply {x,y}
        plugins: {
            legend: { position: 'top' },
            title: chartTitle
                ? { display: true, text: chartTitle }
                : { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: any) =>
                        formatY ? formatY(ctx.parsed.y) : `${ctx.parsed.y}`,
                    title: (items: any[]) =>
                        formatX ? formatX(items[0].parsed.x) : `${items[0].parsed.x}`,
                },
            },
        },
        scales: {
            x: {
                type: 'time',          // works for ISO strings & epoch ms
                title: { display: true, text: xLabel },
                ticks: {
                    callback: formatX,
                },
            },
            y: {
                title: { display: true, text: yLabel },
                ticks: {
                    callback: formatY,
                },
            },
        },
    };

    return <Line data={data} options={options} />;
};

/* ---------------- Public wrapper ---------------- */

export const BasicLineChart: React.FC<{ config: LineChartConfig }> = ({
                                                                          config,
                                                                      }) => (
    <ScadableAPIKeyProvider initialKey="">
        <ScadableDeviceIDProvider initialDeviceID={config.deviceID ?? ''} >
            <div style={{ width: '100%', height: 400 }}>
                <ChartBody config={config} />
            </div>
        </ScadableDeviceIDProvider>
    </ScadableAPIKeyProvider>
);
