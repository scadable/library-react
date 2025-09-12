import type { Preview } from '@storybook/react';
import '../src/index.css'; // Import global styles

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on.*' },
        controls: { expanded: true },
    },
};

export default preview;
