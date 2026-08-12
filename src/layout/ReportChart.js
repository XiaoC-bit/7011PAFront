import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";
import { message } from "antd";

const MyLineChart = ({ width, height }) => {
    const { t } = useTranslation();
    const dataRef = useRef([]);
    const loading = useRef(false);
    const queueId = useRef(null);
    const [chartData, setChartData] = useState([]);
    const echartsRef = useRef(null);
    const imgRef = useRef(null);

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
        const __type = "live-testing-data";

        const sendData = {
            "__channel": __channel,
            "__type": __type,
            "offset": 0,
            "limit": 5000,
        };

        try {
            wsService.sendMessage(sendData);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, recvData) => {
                PubSub.unsubscribe(token);
                loading.current = false;

                if (recvData.queue_id !== queueId.current) {
                    queueId.current = recvData.queue_id;
                    dataRef.current = [];
                    setChartData([]);
                    return;
                }

                const rawItems = recvData.data || [];
                if (rawItems.length === 0) return;

                // 后端返回 time 单位为微秒，这里转换为秒
                const newItems = rawItems.map(d => ({
                    time: d.time / 1000,
                    torque: d.torque,
                }));

                // 如果新数据和旧数据长度相同，最后一个点的时间相同，就认为没变化
                const newLastTime = newItems[newItems.length - 1]?.time;
                const oldLastTime = dataRef.current[dataRef.current.length - 1]?.time;

                if (
                    dataRef.current.length === newItems.length &&
                    newLastTime === oldLastTime
                ) {
                    return;
                }

                dataRef.current = newItems;
                setChartData(newItems);
            });
        } catch (err) {
            message.error(err.message);
            loading.current = false;
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, 2000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleBeforePrint = () => {
            const instance = echartsRef.current?.getEchartsInstance();
            if (instance && imgRef.current) {
                const url = instance.getDataURL({
                    type: 'png',
                    pixelRatio: 2,
                    backgroundColor: '#fff',
                });
                imgRef.current.src = url;
            }
        };
        window.addEventListener('beforeprint', handleBeforePrint);
        return () => window.removeEventListener('beforeprint', handleBeforePrint);
    }, []);

    const option = {
        tooltip: {
            trigger: 'axis',
            show: true,
            formatter: (params) => {
                const xVal = params[0]?.axisValue;
                let content = `${getLabel("time")}: ${parseFloat(xVal).toFixed(3)}<br/>`;
                params.forEach(p => {
                    content += `${p.seriesName}: ${parseFloat(p.data[1]).toFixed(3)}<br/>`;
                });
                return content;
            },
            axisPointer: { type: 'cross' },
        },
        legend: {
            data: [getLabel("torque")],
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            top: '10%',
        },
        xAxis: {
            type: 'value',
            name: getLabel("time"),
            nameLocation: 'end',
            nameGap: 50,
            axisLabel: {
                formatter: (value) => value.toFixed(3),
            },
        },
        yAxis: {
            type: 'value',
            name: getLabel("torque"),
            position: 'left',
        },
        series: [
            {
                name: getLabel("torque"),
                type: 'line',
                showSymbol: false,
                lineStyle: { width: 1 },
                data: chartData.map(d => [d.time, d.torque]),
                // sampling: 'lttb',
                // large: true,   
            },
        ],
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <ReactECharts
                ref={echartsRef}
                option={option}
                style={{ width: width || "100%", height: height || "500px" }}
                notMerge={true}
                lazyUpdate={true}
            />
            <img
                ref={imgRef}
                className="chart-print-img"
                alt="chart"
                style={{ display: "none", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
        </div>
    );
};

export default MyLineChart;
