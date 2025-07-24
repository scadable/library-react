import React from 'react';
import {
    TelemetryBarChart,
    TelemetryMixedChart,
    TelemetryScatterChart,
} from '../index';

export default { title: 'Charts/Telemetry (Advanced)', parameters: { layout: 'fullscreen' } };

const Wrap = (Comp, args) => (
    <div style={{ width: '100%', height: '60vh' }}>
        <Comp {...args} />
    </div>
);

/* prettier-ignore */
const common = { deviceCode: 'SZKYZF3JXGWPHXAN', roundToMs: 1000, bufferSize: 180 };

export const Bar   = () => Wrap(TelemetryBarChart,   { ...common });
export const Mixed = () => Wrap(TelemetryMixedChart, { ...common });
export const Scatter = () => Wrap(TelemetryScatterChart, { ...common, bufferSize: 500 });
