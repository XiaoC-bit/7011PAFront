import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";
import { message, Select, Space } from "antd";

const { Option } = Select;

const MyLineChart = ({ width, height }) => {
    const { t } = useTranslation();
    const dataRef = useRef([]);
    const loading = useRef(false);
    const lastId = useRef(null);
    const queueId = useRef(null);
    const [chartData, setChartData] = useState([]);

    const MAX_LENGTH = 2000000;

    const [xField, setXField] = useState("id"); // 默认时间
    const [y1Field, setY1Field] = useState("YZ_mm");
    const [y2Field, setY2Field] = useState("AD2");

    const getLabel = (field) => {
        const keys = {
            id: "chart.label.time",
            AD2: "chart.label.angle",
            AD1: "chart.label.displacement",
            YZ_mm: "chart.label.torque",
        };
        return t(keys[field] || field);
    };

    const fetchData = async () => {
        if (loading.current) return;
        loading.current = true;

        const __channel = "report-message";
        const __type = "live-testing-data";

        const sendData = {
            "__channel": __channel,
            "__type": __type,
            "offset": lastId.current || 0,
            "limit": 5000,
        };

        try {
            wsService.sendMessage(sendData);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, recvData) => {
                PubSub.unsubscribe(token);
                loading.current = false;

                if (recvData.queue_id !== queueId.current) {
                    queueId.current = recvData.queue_id;
                    lastId.current = null;
                    dataRef.current = [];
                    setChartData([]);
                    return;
                }

                const newItems = recvData.data || [];
                if (newItems.length === 0) return;

                lastId.current = newItems[newItems.length - 1].id;
                dataRef.current = [...dataRef.current, ...newItems];
                if (dataRef.current.length > MAX_LENGTH) {
                    dataRef.current = dataRef.current.slice(-MAX_LENGTH);
                }
                setChartData([...dataRef.current]);
            });
        } catch (err) {
            message.error(err.message);
            loading.current = false;
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchData();
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

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
            show: false,
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
                name: xField === "id" && y2Field ? getLabel(y2Field) : "",
                position: 'right',
            }
        ],
        series: getSeries(),
    };

    const yFieldOptions = xField === "id"
        ? ["YZ_mm", "AD2"]
        : ["YZ_mm"];

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <div style={{ padding: 8 }}>
                <Space>
                    <div>
                        <span style={{ marginRight: 6 }}>{t("chart.xAxis")}:</span>
                        <Select value={xField} onChange={(val) => {
                            setXField(val);
                            setY1Field("YZ_mm");
                            setY2Field(val === "id" ? "AD2" : null);
                        }} style={{ width: 160 }}>
                            <Option value="id">{getLabel("id")}（id）</Option>
                            <Option value="AD2">{getLabel("AD2")}（AD2）</Option>
                        </Select>
                    </div>

                    <div>
                        <span style={{ marginRight: 6 }}>{t("chart.y1Axis")}:</span>
                        <Select value={y1Field} onChange={setY1Field} style={{ width: 160 }}>
                            {yFieldOptions.map(opt => (
                                <Option key={opt} value={opt}>
                                    {getLabel(opt)}（{opt}）
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {xField === "id" && (
                        <div>
                            <span style={{ marginRight: 6 }}>{t("chart.y2Axis")}:</span>
                            <Select value={y2Field} onChange={setY2Field} style={{ width: 160 }}>
                                {["YZ_mm", "AD2"].map(opt => (
                                    <Option key={opt} value={opt}>
                                        {getLabel(opt)}（{opt}）
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}
                </Space>
            </div>

            <ReactECharts
                option={option}
                style={{ width: width || "100%", height: height || "500px" }}
                notMerge={true}
                lazyUpdate={true}
            />
        </div>
    );
};

export default MyLineChart;
