// // src/stories/LiveLineChart.stories.tsx
// import React from 'react';
// import { Meta, StoryObj } from '@storybook/react';
// import { BasicLineChart } from '../components/BasicLineChart';
//
// const LiveChart = () => {// keep last 120 points
//
//     return (
//         <BasicLineChart
//             config={{
//                 apiKey: '',                      // empty is fine now
//                 deviceID: 'SZKYZF3JXGWPHXAN',
//                 xKey:  'timestamp',
//                 xLabel:'Time',
//                 formatX: (iso: string) =>
//                     new Date(iso).toLocaleTimeString(),
//
//                 yKey:  'data.temp',              // <-- matches your payload
//                 yLabel:'Temp (°C)',
//
//                 chartTitle:'Live temperature',
//                 color:'#ff5722',
//                 showDots: true,                  // show points
//             }}
//         />
//     );
// };
//
// export default {
//     title: 'LiveLineChart',
//     component: LiveChart,
//     parameters: { layout: 'fullscreen' },
// } satisfies Meta<typeof LiveChart>;
//
// export const Default: StoryObj<typeof LiveChart> = {};
