import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";
import { message } from "antd";

const MyLineChart = ({ width, height }) => {
    const { t } = useTranslation();
    const dataRef = useRef([]);             // 用于保存数据，不触发 re-render
    const loading = useRef(false);          // 用于控制数据加载状态
    const lastId = useRef(null);            // 最后一个 ID，用于控制数据分页
    const queueId = useRef(null);           // 用于区分不同的队列
    const [chartData, setChartData] = useState([]); // 用于保存需要渲染的图表数据

    const MAX_LENGTH = 2000000; // 数据最大长度

    const fetchData = async () => {
        // 如果正在加载，跳过
        if (loading.current) return;
        loading.current = true;

        const __channel = "report-message";
        const __type = "live-testing-data";

        const sendData = {
            "__channel": __channel,
            "__type": __type,
            "offset": lastId.current || 0,  // 使用上次的 ID
            "limit": 5000,                      // 每次请求最多返回5000条数据
        };

        try {
            wsService.sendMessage(sendData);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, recvData) => {
                PubSub.unsubscribe(token);
                loading.current = false;  // 请求完成，解除加载状态

                // 如果数据队列 ID 不一致，重置数据
                if (recvData.queue_id !== queueId.current) {
                    queueId.current = recvData.queue_id;
                    lastId.current = null;
                    dataRef.current = [];
                    setChartData([]);  // 清空图表数据
                    return;
                }

                const newItems = recvData.data || [];

                if (newItems.length === 0) return;  // 如果没有数据，返回

                // 更新最新的最后一个数据 ID
                lastId.current = newItems[newItems.length - 1].id;

                // 合并新的数据，并保持不超过最大数据长度
                dataRef.current = [...dataRef.current, ...newItems];
                if (dataRef.current.length > MAX_LENGTH) {
                    dataRef.current = dataRef.current.slice(-MAX_LENGTH);
                }

                // 只更新图表所需的数据
                setChartData([...dataRef.current]);
            });
        } catch (err) {
            message.error(err.message);
            loading.current = false;  // 请求失败，解除加载状态
        }
    };

    // 启动定时拉取数据
    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log("Fetching data...");
            fetchData();
        }, 1000);

        return () => clearInterval(intervalId);  // 清理定时器
    }, []);  // 空数组，意味着这个 effect 只会在组件挂载时执行一次

    // 配置图表选项
    const option = {
        tooltip: {
            trigger: 'axis',
            show: false,
            formatter: (params) => {
                const angle = params[0]?.axisValue;
                let content = `${t("angleLabel")}: ${parseFloat(angle).toFixed(3)}<br/>`;
                params.forEach(p => {
                    content += `${t(p.seriesName)}: ${parseFloat(p.data[1]).toFixed(3)}<br/>`;
                });
                return content;
            },
            axisPointer: { type: 'cross' },
        },
        legend: {
            data: [t("torqueLabel"), t("displacementLabel")],
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            top: '10%',
        },
        xAxis: {
            type: 'value',
            name: t("angleLabel"),
            nameLocation: 'end',
            nameGap: 25,
            axisLabel: {
                formatter: (value) => value.toFixed(1),
            },
        },
        yAxis: [
            {
                type: 'value',
                name: t("torqueLabel"),
                position: 'left',
            },
            {
                type: 'value',
                name: t("displacementLabel"),
                position: 'right',
            }
        ],
        series: [
            {
                name: t("torqueLabel"),
                type: 'line',
                yAxisIndex: 0,
                showSymbol: false,
                lineStyle: {
                    width: 1,
                },
                data: chartData.map(d => [d.AD2, d.YZ_mm]),
            },
            {
                name: t("displacementLabel"),
                type: 'line',
                yAxisIndex: 1,
                showSymbol: false,
                lineStyle: {
                    width: 1,
                },
                data: chartData.map(d => [d.AD2, d.AD1]),
            },
        ],
    };

    return (
        <ReactECharts
            option={option}
            style={{ width: width || "100%", height: "100%" }}
            notMerge={true}
            lazyUpdate={true}
        />
    );
};

export default MyLineChart;
