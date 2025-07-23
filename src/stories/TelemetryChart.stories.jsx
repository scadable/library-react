import React from 'react';
import { storiesOf } from '@storybook/react';

import TelemetryChart from '../components/TelemetryChart';

const stories = storiesOf('Charts', module);

stories.add('Telemetry Chart', () => {
    return (
        <div style={{ width: '100%', height: '400px' }}>
            <TelemetryChart />
        </div>
    );
});

