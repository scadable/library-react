import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { TelemetryBarChart } from './TelemetryBarChart';

import 'chartjs-adapter-date-fns';
import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const WS_BASE = 'ws://138.197.150.159:8004';
const get = (o, p) => p.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), o);

export function TelemetryMixedChart({
                                        deviceCode,
                                        xPath,
                                        tempPath,
                                        humidPath,
                                        roundToMs,
                                        bufferSize,
                                        colors,
                                    }) {
    const [pts, setPts] = useState([]);
    const wsRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_BASE}/?subject=devices.${deviceCode}.telemetry`);
        wsRef.current = ws;
        ws.onmessage = (e) => {
            let m; try { m = JSON.parse(e.data); } catch { return; }
            const ts = new Date(get(m, xPath)).getTime();
            const x  = new Date(Math.floor(ts / roundToMs) * roundToMs);
            const t  = Number(get(m, tempPath));
            const h  = Number(get(m, humidPath));
            if (Number.isNaN(t) || Number.isNaN(h)) return;

            setPts(prev => {
                const nxt = [...prev];
                if (nxt.length && nxt[nxt.length - 1].x.getTime() === x.getTime()) {
                    nxt[nxt.length - 1] = { x, t, h };
                } else {
                    nxt.push({ x, t, h });
                }
                return nxt.slice(-bufferSize);
            });
        };
        return () => ws.close();
    }, [deviceCode, xPath, tempPath, humidPath, roundToMs, bufferSize]);

    const data = {
        labels: pts.map(p => p.x),
        datasets: [
            // Temperature – smooth gradient area
            {
                type: 'line',
                label: 'Temperature (°C)',
                data: pts.map(p => p.t),
                borderColor: colors.temp,
                backgroundColor: ctx => {
                    const { chart } = ctx;
                    const g = chart.ctx.createLinearGradient(0, 0, 0, chart.height);
                    g.addColorStop(0, `${colors.temp}55`);
                    g.addColorStop(1, `${colors.temp}00`);
                    return g;
                },
                tension: 0.35,
                fill: true,
                yAxisID: 'y',
                pointRadius: 0,
            },
            // Humidity – vertical bars
            {
                type: 'bar',
                label: 'Humidity (%)',
                data: pts.map(p => p.h),
                backgroundColor: colors.humid,
                borderRadius: 4,
                yAxisID: 'y2',
                barPercentage: 0.9,
                categoryPercentage: 0.9,
            },
        ],
    };

    const options = {
        responsive: true,
        interaction: { intersect: false, mode: 'index' },
        scales: {
            x: {
                type: 'time',
                time: { tooltipFormat: 'HH:mm:ss', displayFormats: { second: 'HH:mm:ss' } },
                ticks: { callback: v => format(new Date(v), 'HH:mm:ss'), maxRotation: 0 },
                grid: { display: false },
            },
            y:  { position: 'left',  title: { text: '°C', display: true }, grid: { color: '#eee' } },
            y2: { position: 'right', title: { text: '%', display: true }, grid: { drawOnChartArea: false } },
        },
        plugins: { legend: { position: 'bottom' } },
    };

    return <Chart type="bar" data={data} options={options} />;
}

TelemetryMixedChart.propTypes = TelemetryBarChart.propTypes;
TelemetryMixedChart.defaultProps = TelemetryBarChart.defaultProps;
