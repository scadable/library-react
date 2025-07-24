import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const WS_BASE = 'ws://138.197.150.159:8004';
const get = (o, p) => p.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), o);

export function TelemetryScatterChart({
                                          deviceCode,
                                          tempPath,
                                          humidPath,
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
            const t = Number(get(m, tempPath));
            const h = Number(get(m, humidPath));
            if (Number.isNaN(t) || Number.isNaN(h)) return;
            setPts(prev => [...prev, { x: t, y: h }].slice(-bufferSize));
        };
        return () => ws.close();
    }, [deviceCode, tempPath, humidPath, bufferSize]);

    const data = {
        datasets: [{
            label: 'Temp vs Humidity',
            data: pts,
            backgroundColor: colors.dot,
            pointRadius: 4,
        }],
    };

    const options = {
        responsive: true,
        scales: {
            x: { title: { display: true, text: 'Temperature (°C)' }, grid: { color: '#eee' } },
            y: { title: { display: true, text: 'Humidity (%)'     }, grid: { color: '#eee' } },
        },
        plugins: { legend: { display: false }, tooltip: { intersect: false } },
    };

    return <Scatter data={data} options={options} />;
}

TelemetryScatterChart.propTypes = {
    deviceCode: PropTypes.string.isRequired,
    tempPath:   PropTypes.string,
    humidPath:  PropTypes.string,
    bufferSize: PropTypes.number,
    colors:     PropTypes.shape({ dot: PropTypes.string }),
};
TelemetryScatterChart.defaultProps = {
    tempPath: 'data.temp',
    humidPath: 'data.humidity',
    bufferSize: 500,
    colors: { dot: '#9b51e0' },
};
