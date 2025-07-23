import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register the pieces we actually use
ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const WS_BASE = 'ws://138.197.150.159:8004';

function get(obj, path) {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

/**
 * Live-updating telemetry line chart (Chart.js)
 */
export function TelemetryChart({
                                   deviceCode,   // e.g. "SZKYZF3JXGWPHXAN"
                                   xPath,        // "timestamp"
                                   yPath,        // "data.temp"
                                   roundToMs,    // 1000 ⇒ 1 s buckets
                                   bufferSize,   // max points to retain
                                   color,
                               }) {
    const [points, setPoints] = useState([]);
    const wsRef = useRef(null);

    useEffect(() => {
        const url = `${WS_BASE}/?subject=devices.${deviceCode}.telemetry`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onmessage = (e) => {
            let msg;
            try {
                msg = JSON.parse(e.data);
            } catch {
                return;
            }

            const rawX = get(msg, xPath);
            const rawY = get(msg, yPath);
            if (rawX == null || rawY == null) return;

            const ts   = new Date(rawX).getTime();
            const xVal = new Date(Math.floor(ts / roundToMs) * roundToMs); // bucket
            const yVal = Number(rawY);

            setPoints((prev) => {
                const next = [...prev];

                // if last point has same x, replace it (debounce)
                if (next.length && next[next.length - 1].x.getTime() === xVal.getTime()) {
                    next[next.length - 1] = { x: xVal, y: yVal };
                } else {
                    next.push({ x: xVal, y: yVal });
                }
                return next.slice(-bufferSize);
            });
        };

        return () => ws.close();
    }, [deviceCode, xPath, yPath, roundToMs, bufferSize]);

    const data = {
        datasets: [
            {
                label: yPath,
                data: points,
                borderColor: color,
                backgroundColor: `${color}33`,
                fill: true,
                tension: 0.4,
                pointRadius: 0,           // smoother look
            },
        ],
    };

    const options = {
        responsive: true,
        animation: false,
        scales: {
            x: {
                type: 'time',
                bounds: 'ticks',
                time: {
                    tooltipFormat: 'HH:mm:ss',
                    displayFormats: { second: 'HH:mm:ss' },
                },
                ticks: {
                    source: 'auto',
                    autoSkip: true,
                    maxTicksLimit: 8,
                    callback: (v, i, ticks) =>
                        format(new Date(v), 'HH:mm:ss'), // trim label
                },
                grid: { color: '#eee' },
            },
            y: {
                grid: { color: '#eee' },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: { intersect: false, mode: 'index' },
        },
    };

    return <Line data={data} options={options} />;
}

TelemetryChart.propTypes = {
    deviceCode: PropTypes.string.isRequired,
    xPath:      PropTypes.string,  // dot-path
    yPath:      PropTypes.string,
    roundToMs:  PropTypes.number,
    bufferSize: PropTypes.number,
    color:      PropTypes.string,
};
TelemetryChart.defaultProps = {
    xPath: 'timestamp',
    yPath: 'data.temp',
    roundToMs: 1000,
    bufferSize: 180,  // ~3 minutes @1 s
    color: '#00bcd4',
};
