import React from 'react';
import { TelemetryChart } from '../components/TelemetryChart';

export default {
    title: 'Charts/TelemetryChart',
    component: TelemetryChart,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        deviceCode: { control: 'text' },
        xPath:      { control: 'text' },
        yPath:      { control: 'text' },
        roundToMs:  { control: { type: 'number', min: 100, step: 100 } },
        bufferSize: { control: { type: 'number', min: 10 } },
        color:      { control: 'color' },
    },
};

const Template = (args) => (
    <div style={{ width: '100%', height: '60vh' }}>
        <TelemetryChart {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    deviceCode: 'SZKYZF3JXGWPHXAN',
    xPath: 'timestamp',
    yPath: 'data.temp',
    roundToMs: 1000,
    bufferSize: 200,
    color: '#00bcd4',
};
