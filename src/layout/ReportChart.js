import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from 'react-i18next';

// 示例数据
const data = [
    { angle: 0, torque: 10, displacement: 5 },
    { angle: 10, torque: 15, displacement: 10 },
    { angle: 20, torque: 20, displacement: 15 },
    { angle: 30, torque: 25, displacement: 20 },
    { angle: 40, torque: 30, displacement: 25 },
    { angle: 50, torque: 35, displacement: 30 },
    { angle: 60, torque: 40, displacement: 35 },
];

const MyLineChart = ({ width, height }) => {
    const { t } = useTranslation();

    return (
        <ResponsiveContainer width={width} height={height}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="angle" label={{ value: t('angleLabel'), position: 'insideBottomRight', offset: 0 }} />
                <YAxis yAxisId="left" label={{ value: t('torqueLabel'), angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: t('displacementLabel'), angle: -90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="torque" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="displacement" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MyLineChart;