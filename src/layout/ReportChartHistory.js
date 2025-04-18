import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";
import { message } from "antd";
import ReactECharts from "echarts-for-react";

const HistoryChart = ({ width = "100%", height = "100%", req_queue_id, method }) => {
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

            const newItems = (recvData.data || []).filter((item) => {
                const uniqueId = item.id || JSON.stringify(item);
                if (loadedIds.current.has(uniqueId)) return false;
                loadedIds.current.add(uniqueId);
                return true;
            });

            if (newItems.length > 0) {
                dataRef.current = [...dataRef.current, ...newItems];
                setData([...dataRef.current]);

                if (newItems.length === LIMIT) {
                    fetchData(); // 拉下一页
                }
            }
        });
    };

    useEffect(() => {
        if (!req_queue_id || !method) return;
        dataRef.current = [];
        loadedIds.current.clear();
        setData([]);
        fetchData();
    }, [req_queue_id, method]);

    const processedData = useMemo(() => [...data], [data]);

    // Prepare series data arrays
    const AD2 = processedData.map((item) => item.AD2);
    const YZ_mm = processedData.map((item) => item.YZ_mm);
    const AD1 = processedData.map((item) => item.AD1);

    const option = {
        animation: false,
        tooltip: {
            show: false, // 🚫 关闭悬停 tooltip，优化性能
        },
        legend: {
            data: [t("torqueLabel"), t("displacementLabel")],
        },
        grid: {
            top: 40,
            bottom: 50,
            left: 50,
            right: 50,
        },
        xAxis: {
            type: "value",
            name: t("angleLabel"),
            nameLocation: "end",
            nameGap: 25,
            axisLabel: {
                formatter: (val) => parseFloat(val).toFixed(1),
            },
            min: "dataMin",
            max: "dataMax",
        },
        yAxis: [
            {
                type: "value",
                name: t("torqueLabel"),
                position: "left",
                axisLabel: {
                    formatter: "{value}",
                },
            },
            {
                type: "value",
                name: t("displacementLabel"),
                position: "right",
                axisLabel: {
                    formatter: "{value}",
                },
            },
        ],
        series: [
            {
                name: t("torqueLabel"),
                type: "line",
                data: AD2.map((x, i) => [x, YZ_mm[i]]),
                yAxisIndex: 0,
                showSymbol: false,
                lineStyle: { width: 1, color: "#8884d8" },
                sampling: "lttb",
            },
            {
                name: t("displacementLabel"),
                type: "line",
                data: AD2.map((x, i) => [x, AD1[i]]),
                yAxisIndex: 1,
                showSymbol: false,
                lineStyle: { width: 1, color: "#82ca9d" },
                sampling: "lttb",
            },
        ],
    };

    return (
        <div style={{ width, height }}>
            <ReactECharts
                option={option}
                notMerge={true}
                lazyUpdate={true}
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
};

export default HistoryChart;
