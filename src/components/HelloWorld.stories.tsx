import { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { HelloWorld } from './HelloWorld';

const meta: Meta<typeof HelloWorld> = {
    title: 'Example/HelloWorld',
    component: HelloWorld,
};

export default meta;

type Story = StoryObj<typeof HelloWorld>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Hello World')).toBeInTheDocument();
    },
};
