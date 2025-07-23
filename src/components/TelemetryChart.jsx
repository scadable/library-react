import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

// Your fixed socket endpoint
const BASE_WS_URL = 'ws://138.197.150.159:8004';

function get(obj, path) {
    // simple dot-path getter: "data.temp" → obj.data.temp
    return path
        .split('.')
        .reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

export const TelemetryChart = ({
                                   id,
                                   xKey,
                                   yKey,
                                   bufferSize,
                                   chartType,
                                   color,
                               }) => {
    const [data, setData] = useState([]);
    const wsRef = useRef(null);

    useEffect(() => {
        // Build full URL: add ?subject={id}.telemetry
        const url = `${BASE_WS_URL}/?subject=${encodeURIComponent(
            id + '.telemetry'
        )}`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.addEventListener('open', () => {
            console.log('TelemetryChart socket open:', url);
        });

        ws.addEventListener('message', (evt) => {
            let msg;
            try {
                msg = JSON.parse(evt.data);
            } catch (err) {
                console.error('Invalid JSON:', evt.data);
                return;
            }

            // drill out the two values
            const x = get(msg, xKey);
            const y = get(msg, yKey);

            if (x === undefined || y === undefined) {
                console.warn(
                    `TelemetryChart: could not resolve xKey='${xKey}' or yKey='${yKey}'`,
                    msg
                );
                return;
            }

            setData((prev) => {
                const next = [...prev, { [xKey]: x, [yKey]: y }];
                return next.length > bufferSize
                    ? next.slice(next.length - bufferSize)
                    : next;
            });
        });

        ws.addEventListener('error', (err) => {
            console.error('TelemetryChart socket error', err);
        });

        return () => {
            ws.close();
        };
    }, [id, xKey, yKey, bufferSize]);

    const Chart = { line: LineChart, area: AreaChart, bar: BarChart }[chartType];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <Chart data={data}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                {chartType === 'line' && (
                    <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke={color}
                        dot={false}
                    />
                )}
                {chartType === 'area' && (
                    <Area
                        type="monotone"
                        dataKey={yKey}
                        stroke={color}
                        fill={color}
                    />
                )}
                {chartType === 'bar' && <Bar dataKey={yKey} fill={color} />}
            </Chart>
        </ResponsiveContainer>
    );
};

TelemetryChart.propTypes = {
    /** like "devices.SZKYZF3JXGWPHXAN" (we append .telemetry ourselves) */
    id: PropTypes.string.isRequired,
    /** e.g. "timestamp" or "data.temp" */
    xKey: PropTypes.string.isRequired,
    /** e.g. "data.temp" or "data.humidity" */
    yKey: PropTypes.string.isRequired,
    bufferSize: PropTypes.number,
    chartType: PropTypes.oneOf(['line', 'area', 'bar']),
    color: PropTypes.string,
};

TelemetryChart.defaultProps = {
    bufferSize: 50,
    chartType: 'line',
    color: '#00bcd4',
};
