import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";
import { message } from "antd";

const X_FIELD = "time";
const Y_FIELD = "torque";
const MS_TO_S = 1e-3;

const HistoryChart = ({ width, height, req_queue_id, method }) => {
    const { t } = useTranslation();
    const loading = useRef(false);
    const [chartData, setChartData] = useState([
        { time: 0, torque: 0 }
    ]);

    const getLabel = (field) => {
        const keys = {
            time: "chart.label.time",
            torque: "chart.label.torque",
        };
        return t(keys[field] || field);
    };

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
        };

        try {
            wsService.sendMessage(sendData);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, recvData) => {
                PubSub.unsubscribe(token);
                loading.current = false;

                if (!recvData.data || recvData.data.length === 0) {
                    setChartData([]);
                    return;
                }

                setChartData(recvData.data);
            });
        } catch (err) {
            message.error(t("fetchFailed"));
            loading.current = false;
        }
    };

    useEffect(() => {
        if (!req_queue_id || !method) return;
        fetchData();
    }, [req_queue_id, method]);

    const getSeries = () => {
        if (chartData.length === 0) return [];

        return [{
            name: getLabel(Y_FIELD),
            type: 'line',
            showSymbol: false,
            lineStyle: { width: 1 },
            data: chartData.map(d => [d[X_FIELD] * MS_TO_S, d[Y_FIELD]]),
        }];
    };

    const option = {
        tooltip: {
            trigger: 'axis',
            show: true,
            formatter: (params) => {
                const xVal = params[0]?.data[0];
                let content = `${getLabel(X_FIELD)}: ${Number(xVal).toFixed(6)}<br/>`;
                params.forEach(p => {
                    content += `${p.seriesName}: ${Number(p.data[1]).toFixed(3)}<br/>`;
                });
                return content;
            },
            axisPointer: { type: 'cross' },
        },
        legend: {
            data: getSeries().map(s => s.name),
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            top: '10%',
        },
        xAxis: {
            type: 'value',
            name: getLabel(X_FIELD),
            nameLocation: 'end',
            nameGap: 50,
            axisLabel: {
                formatter: (value) => value.toFixed(3),
            },
        },
        yAxis: {
            type: 'value',
            name: getLabel(Y_FIELD),
        },
        series: getSeries(),
    };

    const chartRef = useRef();

    useEffect(() => {
        const timer = setTimeout(() => {
            chartRef.current?.getEchartsInstance().resize();
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactECharts
                ref={chartRef}
                option={option}
                style={{ width: "100%", height: "100%" }}
                notMerge={true}
                lazyUpdate={true}
            />
        </div>
    );
};

export default HistoryChart;
