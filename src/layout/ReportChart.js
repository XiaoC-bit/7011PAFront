import React, { useEffect, useState, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";
import { message } from "antd";

const MyLineChart = ({ width, height }) => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const loading = useRef(false);
    const loadedIds = useRef(new Set());
    const dataRef = useRef([]);
    const queue_id = useRef(0);

    const fetchData = async () => {
        if (loading.current) return;

        loading.current = true;
        try {
            const __channel = "report-message";
            const __type = "live-testing-data";
            const sendData = {
                "__channel": __channel,
                "__type": __type,
                "offset": dataRef.current.length,
                "limit": 5000,
            };

            wsService.sendMessage(sendData);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, recvData) => {
                PubSub.unsubscribe(token);
                loading.current = false;

                if (recvData.queue_id !== queue_id.current) {
                    queue_id.current = recvData.queue_id;
                    loadedIds.current.clear();
                    dataRef.current = [];
                    setData([]); // Clear the data if the queue_id changes
                    return;
                }


                const newItems = recvData.data.filter((item) => {
                    if (loadedIds.current.has(item.id)) return false;
                    loadedIds.current.add(item.id);
                    return true;
                });

                if (newItems.length > 0) {
                    const merged = [...dataRef.current, ...newItems];
                    dataRef.current = merged;
                    setData(merged);
                }
            });
        } catch (error) {
            message.error(error.message);
            loading.current = false;
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 2000);
        return () => clearInterval(intervalId);
    }, []);

    // Process data to sort by angle (AD2) for proper display
    const processedData = React.useMemo(() => {
        return [...data];
        // return [...data].sort((a, b) => a.AD2 - b.AD2);
    }, [data]);

    return (
        <ResponsiveContainer width={width} height={height}>
            <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                    dataKey="AD2"
                    label={{
                        value: t("angleLabel"),
                        position: "insideBottomRight",
                        offset: 0,
                    }}
                    tickFormatter={(value) => value.toFixed(1)}
                    domain={['dataMin', 'dataMax']}
                    type="number"
                />

                <YAxis
                    yAxisId="left"
                    label={{
                        value: t("torqueLabel"),
                        angle: -90,
                        position: "insideLeft",
                    }}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                        value: t("displacementLabel"),
                        angle: -90,
                        position: "insideRight",
                    }}
                />
                <Tooltip
                    formatter={(value, name, props) => {
                        return [value, t(name)];
                    }}
                    labelFormatter={(label) => `Angle: ${parseFloat(label).toFixed(1)}`}
                />
                <Legend />
                <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="YZ_mm"
                    stroke="#8884d8"
                    dot={false}
                    name="torque"
                    isAnimationActive={false}
                />
                <Line
                    yAxisId="right"
                    type="linear"
                    dataKey="AD1"
                    stroke="#82ca9d"
                    dot={false}
                    name="displacementLabel"
                    isAnimationActive={false}
                />

            </LineChart>
        </ResponsiveContainer>
    );
};

export default MyLineChart;