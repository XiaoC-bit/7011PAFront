import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';
import { message } from 'antd';





const MyLineChart = ({ width, height }) => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);


    const fetchData = async () => {
        try {
            const __channel = "report-message";
            const __type = "live-testing-data";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                setData(data.data);
                if (data.status === 'success') {
                    //message.success(t('spin success'));
                } else {

                }
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 2000);

        return () => clearInterval(intervalId); // 清除定时器
    }, []);


    return (
        <ResponsiveContainer width={width} height={height}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="angle" domain={[0, 360]} label={{
                    value: t('angleLabel'), position: 'insideBottomRight', offset: 0,

                }} />
                <YAxis yAxisId="left" label={{ value: t('torqueLabel'), angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: t('displacementLabel'), angle: -90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="torque" stroke="#8884d8" dot={false} name={t("torque")} />
                <Line yAxisId="right" type="monotone" dataKey="yz_mm" stroke="#82ca9d" dot={false} name={t("displacementLabel")} />            </LineChart>
        </ResponsiveContainer>
    );
};

export default MyLineChart;