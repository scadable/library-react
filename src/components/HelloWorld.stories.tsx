import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { HelloWorld } from './HelloWorld';

const meta: Meta<typeof HelloWorld> = {
    title: 'Example/HelloWorld',
    component: HelloWorld,
};

export default meta;

type Story = StoryObj<typeof HelloWorld>;

export const Default: Story = {};
