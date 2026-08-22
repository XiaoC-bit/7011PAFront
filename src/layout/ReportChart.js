import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";
import { message, Button, Space } from "antd";

const MyLineChart = ({ width, height }) => {
    const { t } = useTranslation();
    const dataRef = useRef([]);
    const loading = useRef(false);
    const queueId = useRef(null);
    const [chartData, setChartData] = useState([]);
    const echartsRef = useRef(null);
    const imgRef = useRef(null);

    const [selectMode, setSelectMode] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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

                const newItems = rawItems.map(d => ({
                    time: d.time / 1000,
                    torque: d.torque,
                }));

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
            if (!selectMode) {
                fetchData();
            }
        }, 2000);
        return () => clearInterval(intervalId);
    }, [selectMode]);

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

    const handleToggleSelectMode = () => {
        setSelectMode(prev => {
            const next = !prev;
            if (!next) {
                setSelectedRange(null);
            }
            return next;
        });
    };

    const handleCancelSelect = () => {
        setSelectMode(false);
        setSelectedRange(null);
    };

    // ---- 用 ref 存储范围，避免每次 dataZoom 事件都触发 setState -> re-render -> setOption ----
    const selectedRangeRef = useRef(null);

    const handleDataZoomEnd = () => {
        const instance = echartsRef.current?.getEchartsInstance();
        if (!instance) return;

        const option = instance.getOption();
        const dz = option.dataZoom && option.dataZoom[0];
        if (!dz) return;

        const startValue = dz.startValue;
        const endValue = dz.endValue;

        if (startValue != null && endValue != null) {
            selectedRangeRef.current = { start: startValue, end: endValue };
            // 只在这里才真正 setState，用来更新按钮可用状态和显示文案
            // 这次 setState 之后不会再传回 option（见下面 option 的 useMemo），所以不会重建 dataZoom
            setSelectedRange({ start: startValue, end: endValue });
        }
    };

    const handleSubmitRange = async () => {
        const range = selectedRangeRef.current;
        if (!range) {
            message.warning(t("chart.select.noRangeSelected", "请先拖动选择时间范围"));
            return;
        }

        setSubmitting(true);

        const __channel = "report-message";
        const __type = "set-time-range"; // TODO: 与后端约定的实际 type

        const sendData = {
            "__channel": __channel,
            "__type": __type,
            "start_time": Math.round(range.start * 1000),
            "end_time": Math.round(range.end * 1000),
        };

        try {
            wsService.sendMessage(sendData);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, recvData) => {
                PubSub.unsubscribe(token);
                setSubmitting(false);

                if (recvData?.success) {
                    message.success(t("chart.select.submitSuccess", "时间范围提交成功"));
                    setSelectMode(false);
                    setSelectedRange(null);
                    selectedRangeRef.current = null;
                } else {
                    message.error(recvData?.message || t("chart.select.submitFailed", "提交失败"));
                }
            });
        } catch (err) {
            setSubmitting(false);
            message.error(err.message);
        }
    };

    // ---- 关键改动：option 只依赖真正需要触发重绘的东西 (chartData, selectMode)，
    // 不依赖 selectedRange，这样拖动过程中的 setSelectedRange 不会导致 option 对象变化、
    // 不会触发 ReactECharts 重新 setOption，dataZoom 组件不会被打断 ----
    const option = useMemo(() => ({
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
            bottom: selectMode ? '22%' : '15%',
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
        dataZoom: selectMode ? [
            {
                id: 'timeRangeSelector',
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'none',
                height: 24,
                bottom: 10,
                realtime: true,
                throttle: 100,
            },
        ] : [],
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [chartData, selectMode]);

    const onEvents = useMemo(() => ({
        dataZoomend: handleDataZoomEnd,
        datazoom: handleDataZoomEnd,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <Space style={{ marginBottom: 8 }}>
                <Button
                    type={selectMode ? "primary" : "default"}
                    onClick={handleToggleSelectMode}
                >
                    {t("chart.button.selectTime", "时间选择")}
                </Button>
                {selectMode && (
                    <>
                        <Button
                            type="primary"
                            disabled={!selectedRange}
                            loading={submitting}
                            onClick={handleSubmitRange}
                        >
                            {t("chart.button.submit", "提交")}
                        </Button>
                        <Button onClick={handleCancelSelect}>
                            {t("chart.button.cancel", "取消")}
                        </Button>
                    </>
                )}
                {selectMode && selectedRange && (
                    <span>
                        {getLabel("time")}: {selectedRange.start.toFixed(3)} ~ {selectedRange.end.toFixed(3)}
                    </span>
                )}
            </Space>
            <ReactECharts
                ref={echartsRef}
                option={option}
                onEvents={onEvents}
                notMerge={false}
                lazyUpdate={true}
                style={{ width: width || "100%", height: height ? `calc(${height} - 40px)` : "460px" }}
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