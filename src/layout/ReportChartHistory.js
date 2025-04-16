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
import { message, Spin } from "antd";

const HistoryChart = ({ width, height, req_queue_id, method }) => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const loading = useRef(false);


    const dataRef = useRef([]);
    const loadedIds = useRef(new Set());

    const LIMIT = 5000;

    const fetchData = async () => {
        if (loading.current) return;

        loading.current = true;
        const __channel = "report-message";
        const __type = "fetch-test-history-detail";

        const sendData = {
            __channel,
            __type,
            req_queue_id,
            method,
            offset: dataRef.current.length,
            limit: LIMIT,
        };

        wsService.sendMessage(sendData);

        const token = PubSub.subscribe(`${__channel}-${__type}`, (_, recvData) => {
            loading.current = false;
            PubSub.unsubscribe(token);

            const newItems = (recvData.data || []).filter(item => {
                const uniqueId = item.id || JSON.stringify(item); // 自定义唯一值策略
                if (loadedIds.current.has(uniqueId)) return false;
                loadedIds.current.add(uniqueId);
                return true;
            });

            if (newItems.length > 0) {
                dataRef.current = [...dataRef.current, ...newItems];
                setData([...dataRef.current]);

                // 如果数据还有很多，继续拉
                if (newItems.length === LIMIT) {
                    fetchData(); // 递归继续拉下一页
                } else {
                }
            }
        });
    };

    useEffect(() => {
        if (!req_queue_id || !method) return;

        // 清空旧数据（重新加载）
        dataRef.current = [];
        loadedIds.current.clear();
        setData([]);
        fetchData();
    }, []);

    const processedData = React.useMemo(() => {
        return [...data];
    }, [data]);

    return (
        <ResponsiveContainer width="100%" height="100%">
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
                    domain={["dataMin", "dataMax"]}
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
                    formatter={(value, name) => [parseFloat(value).toFixed(3), t(name)]}
                    labelFormatter={(label) => `Angle: ${parseFloat(label).toFixed(3)}`}
                />
                <Legend />
                <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="YZ_mm"
                    stroke="#8884d8"
                    dot={false}
                    name={t("torqueLabel")}
                    isAnimationActive={false}
                />
                <Line
                    yAxisId="right"
                    type="linear"
                    dataKey="AD1"
                    stroke="#82ca9d"
                    dot={false}
                    name={t("displacementLabel")}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default HistoryChart;
