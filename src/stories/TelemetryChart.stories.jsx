import React from 'react';
import { TelemetryChart } from '../components/TelemetryChart';

export default {
    title: 'Charts/TelemetryChart',
    component: TelemetryChart,
    argTypes: {
        id: { control: 'text' },
        xKey: { control: 'text' },
        yKey: { control: 'text' },
        bufferSize: {
            control: { type: 'number', min: 1, max: 500 },
        },
        chartType: {
            control: 'radio',
            options: ['line', 'area', 'bar'],
        },
        color: { control: 'color' },
    },
};

const Template = (args) => (
    <div style={{ width: '100%', height: '400px' }}>
        <TelemetryChart {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    // just the ID prefix; ".telemetry" is appended under the hood
    id: 'devices.SZKYZF3JXGWPHXAN',
    // incoming JSON has top-level "timestamp"
    xKey: 'timestamp',
    // nested under data.temp
    yKey: 'data.temp',
    bufferSize: 100,
    chartType: 'line',
    color: '#00bcd4',
};
