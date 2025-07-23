import React from 'react';
import { TelemetryChart } from '../components/TelemetryChart';

export default {
    title: 'Charts/TelemetryChart',
    component: TelemetryChart,
};

export const Default = {
    render: (args) => (
        <div style={{ width: '100%', height: 400 }}>
            <TelemetryChart {...args} />
        </div>
    ),
    args: {},          // put story-level props here later
};

