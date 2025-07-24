// File: src/stories/BasicLineChart.stories.tsx

import React from "react";
import { Meta, Story } from "@storybook/react";
import {
    BasicLineChart,
    LineChartConfig,
} from "../components/BasicLineChart";
import { DataPoint } from "../services/LiveQueryService";

export default {
    title: "Charts/BasicLineChart",
    component: BasicLineChart,
    parameters: {
        layout: "fullscreen",
    },
    argTypes: {
        data: {
            control: "object",
            description: "Array of points to render",
        },
        config: {
            control: "object",
            description: "Keys, labels, formatting, and style",
        },
        "config.xKey": { control: "text", name: "X Key" },
        "config.xLabel": { control: "text", name: "X Label" },
        "config.yKey": { control: "text", name: "Y Key" },
        "config.yLabel": { control: "text", name: "Y Label" },
        "config.chartTitle": { control: "text", name: "Chart Title" },
        "config.color": { control: "color", name: "Line Color" },
        "config.showDots": { control: "boolean", name: "Show Dots" },
        "config.formatX": { control: false },
        "config.formatY": { control: false },
    },
} as Meta<typeof BasicLineChart>;

const sampleData: DataPoint[] = Array.from({ length: 20 }).map((_, i) => ({
    timestamp: Date.now() + i * 1000 * 60,
    value: Math.round(20 + 10 * Math.sin(i / 3)),
}));

type StoryProps = {
    data: DataPoint[];
    config: LineChartConfig;
};

const Template: Story<StoryProps> = (args) => (
    <div style={{ width: "100%", height: "60vh" }}>
        <BasicLineChart {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    data: sampleData,
    config: {
        xKey: "timestamp",
        xLabel: "Time",
        formatX: (t: number) => new Date(t).toLocaleTimeString(),
        yKey: "value",
        yLabel: "Value",
        formatY: (v: number) => `${v.toFixed(1)}`,
        chartTitle: "Sample Sine‑Wave Data",
        color: "#00bcd4",
        showDots: false,
    },
};
