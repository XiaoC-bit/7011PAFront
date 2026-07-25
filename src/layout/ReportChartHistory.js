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
    const [chartData, setChartData] = useState([
        {
            id: 0,
            YZ_mm: 0,
            AD2: 0,
            AD1: 0
        }
    ]);

    // const [xField, setXField] = useState("YZ_mm"); // 角度（YZ_mm）作为X轴
    // const [y1Field, setY1Field] = useState("AD2"); // 扭矩（AD2）作为y1轴
    // const [y2Field, setY2Field] = useState("AD1"); // 位移（AD1）作为y2轴


    const [xField, setXField] = useState("id"); // 默认时间
    const [y1Field, setY1Field] = useState("YZ_mm"); // 默认角度
    const [y2Field, setY2Field] = useState("AD2");    // 默认扭矩

    const getLabel = (field) => {
        const keys = {
            id: "chart.label.time",
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
            nameGap: 50,
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

    const yFieldOptions = ["AD2", "AD1"];  // AD2 和 AD1 作为y轴选择

    const chartRef = useRef();

    useEffect(() => {
        const timer = setTimeout(() => {
            chartRef.current?.getEchartsInstance().resize();
        }, 300); // 延迟300ms，确保 Modal 渲染完成

        return () => clearTimeout(timer);
    }, [/* 依赖Modal打开关闭状态 */]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <div style={{ padding: 8 }}>
                <Space>
                    <div>
                        <span style={{ marginRight: 6 }}>{t("chart.xAxis")}:</span>
                        <Select value={xField} onChange={(val) => {
                            setXField(val);
                            setY1Field("AD2");
                            setY2Field(val === "id" ? "AD2" : null);
                        }} style={{ width: 160 }}>
                            <Option value="id">{getLabel("id")}</Option>
                            <Option value="YZ_mm">{getLabel("YZ_mm")}</Option>
                        </Select>
                    </div>

                    <div>
                        <span style={{ marginRight: 6 }}>{t("chart.y1Axis")}:</span>
                        <Select value={y1Field} onChange={setY1Field} style={{ width: 160 }}>
                            {yFieldOptions.map(opt => (
                                <Option key={opt} value={opt}>
                                    {getLabel(opt)}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {xField === "id" && (
                        <div>
                            <span style={{ marginRight: 6 }}>{t("chart.y2Axis")}:</span>
                            <Select value={y2Field} onChange={setY2Field} style={{ width: 160 }}>
                                {["YZ_mm", "AD2", "AD1"].map(opt => (
                                    <Option key={opt} value={opt}>
                                        {getLabel(opt)}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}
                </Space>
            </div>

            <ReactECharts
                ref={chartRef}
                option={option}
                style={{ width: "100%", height: "90%" }}
                notMerge={true}
                lazyUpdate={true}
            />
        </div>
    );
};

export default HistoryChart;
