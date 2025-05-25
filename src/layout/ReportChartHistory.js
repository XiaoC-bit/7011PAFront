import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";
import { message, Select, Space } from "antd";

const { Option } = Select;

const HistoryChart = ({ width, height, req_queue_id, method }) => {
    const { t } = useTranslation();
    const dataRef = useRef([]);
    const loading = useRef(false);
    const [chartData, setChartData] = useState([]);

    // const [xField, setXField] = useState("YZ_mm"); // 角度（YZ_mm）作为X轴
    // const [y1Field, setY1Field] = useState("AD2"); // 扭矩（AD2）作为y1轴
    // const [y2Field, setY2Field] = useState("AD1"); // 位移（AD1）作为y2轴


    const [xField, setXField] = useState("id"); // 默认时间
    const [y1Field, setY1Field] = useState("YZ_mm"); // 默认角度
    const [y2Field, setY2Field] = useState("AD2");    // 默认扭矩

    const getLabel = (field) => {
        const keys = {
            AD2: "chart.label.torque",   // 扭矩
            AD1: "chart.label.displacement", // 位移
            YZ_mm: "chart.label.angle",  // 角度
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

                dataRef.current = recvData.data;
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
        const series = [];

        if (y1Field && chartData.length > 0) {
            series.push({
                name: getLabel(y1Field),
                type: 'line',
                yAxisIndex: 0,
                showSymbol: false,
                lineStyle: { width: 1 },
                data: chartData.map(d => [d[xField], d[y1Field]]),
            });
        }

        if (xField === "id" && y2Field && y2Field !== y1Field) {
            series.push({
                name: getLabel(y2Field),
                type: 'line',
                yAxisIndex: 1,
                showSymbol: false,
                lineStyle: { width: 1 },
                data: chartData.map(d => [d[xField], d[y2Field]]),
            });
        }

        return series;
    };

    const option = {
        tooltip: {
            trigger: 'axis',
            show: true,
            formatter: (params) => {
                const xVal = params[0]?.axisValue;
                let content = `${getLabel(xField)}: ${parseFloat(xVal).toFixed(3)}<br/>`;
                params.forEach(p => {
                    content += `${p.seriesName}: ${parseFloat(p.data[1]).toFixed(3)}<br/>`;
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
            name: getLabel(xField),
            nameLocation: 'end',
            nameGap: 25,
            axisLabel: {
                formatter: (value) => value.toFixed(1),
            },
        },
        yAxis: [
            {
                type: 'value',
                name: getLabel(y1Field),
                position: 'left',
            },
            {
                type: 'value',
                name: xField === "YZ_mm" && y2Field ? getLabel(y2Field) : "",
                position: 'right',
            }
        ],
        series: getSeries(),
    };

    const yFieldOptions = ["AD2", "AD1"];  // AD2 和 AD1 作为y轴选择

    return (
        <ReactECharts
            option={option}
            style={{ width: "100%", height: "100%" }}
            notMerge={true}
            lazyUpdate={true}
        />
    );
};

export default HistoryChart;
