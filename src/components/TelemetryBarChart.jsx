import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import 'chartjs-adapter-date-fns';
import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(TimeScale, LinearScale, BarElement, Tooltip, Legend);

/* —————————————————————————————————————————— */
const WS_BASE = 'ws://138.197.150.159:8004';
const get = (o, p) => p.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), o);

export function TelemetryBarChart({
                                      deviceCode,
                                      xPath,
                                      tempPath,
                                      humidPath,
                                      roundToMs,
                                      bufferSize,
                                      colors,
                                  }) {
    const [points, setPoints] = useState([]);
    const wsRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_BASE}/?subject=devices.${deviceCode}.telemetry`);
        wsRef.current = ws;

        ws.onmessage = (e) => {
            let msg;
            try { msg = JSON.parse(e.data); } catch { return; }

            const ts   = new Date(get(msg, xPath)).getTime();
            const xVal = new Date(Math.floor(ts / roundToMs) * roundToMs);
            const tVal = Number(get(msg, tempPath));
            const hVal = Number(get(msg, humidPath));
            if (Number.isNaN(tVal) || Number.isNaN(hVal)) return;

            setPoints(prev => {
                const next = [...prev];
                if (next.length && next[next.length - 1].x.getTime() === xVal.getTime()) {
                    next[next.length - 1] = { x: xVal, t: tVal, h: hVal };
                } else {
                    next.push({ x: xVal, t: tVal, h: hVal });
                }
                return next.slice(-bufferSize);
            });
        };
        return () => ws.close();
    }, [deviceCode, xPath, tempPath, humidPath, roundToMs, bufferSize]);

    const data = {
        labels: points.map(p => p.x),
        datasets: [
            {
                label: 'Temperature (°C)',
                data: points.map(p => p.t),
                backgroundColor: colors.temp,
                borderRadius: 4,
            },
            {
                label: 'Humidity (%)',
                data: points.map(p => p.h),
                backgroundColor: colors.humid,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        animation: false,
        borderSkipped: false,
        scales: {
            x: {
                type: 'time',
                time: { tooltipFormat: 'HH:mm:ss', displayFormats: { second: 'HH:mm:ss' } },
                ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8,
                    callback: v => format(new Date(v), 'HH:mm:ss') },
                grid: { display: false },
            },
            y: { grid: { color: '#eee' }, beginAtZero: true },
        },
        plugins: { legend: { position: 'bottom' } },
    };

    return <Bar data={data} options={options} />;
}

TelemetryBarChart.propTypes = {
    deviceCode: PropTypes.string.isRequired,
    xPath:      PropTypes.string,
    tempPath:   PropTypes.string,
    humidPath:  PropTypes.string,
    roundToMs:  PropTypes.number,
    bufferSize: PropTypes.number,
    colors:     PropTypes.shape({ temp: PropTypes.string, humid: PropTypes.string }),
};
TelemetryBarChart.defaultProps = {
    xPath: 'timestamp',
    tempPath: 'data.temp',
    humidPath: 'data.humidity',
    roundToMs: 1000,
    bufferSize: 180,
    colors: { temp: '#ff6d6d', humid: '#4dadee' },
};
