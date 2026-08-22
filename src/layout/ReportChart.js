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
    const [lockedXRange, setLockedXRange] = useState(null);

    const getLabel = (field) => {
        const keys = { time: "chart.label.time", torque: "chart.label.torque" };
        return t(keys[field] || field);
    };

    const fetchData = async () => {
        if (loading.current) return;
        loading.current = true;

        const __channel = "report-message";
        const __type = "live-testing-data";
        const sendData = { "__channel": __channel, "__type": __type, "offset": 0, "limit": 5000 };

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

                const newItems = rawItems.map(d => ({ time: d.time / 1000, torque: d.torque }));
                const newLastTime = newItems[newItems.length - 1]?.time;
                const oldLastTime = dataRef.current[dataRef.current.length - 1]?.time;

                if (dataRef.current.length === newItems.length && newLastTime === oldLastTime) {
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
            if (!selectMode) fetchData();
        }, 2000);
        return () => clearInterval(intervalId);
    }, [selectMode]);

    useEffect(() => {
        const handleBeforePrint = () => {
            const instance = echartsRef.current?.getEchartsInstance();
            if (instance && imgRef.current) {
                const url = instance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' });
                imgRef.current.src = url;
            }
        };
        window.addEventListener('beforeprint', handleBeforePrint);
        return () => window.removeEventListener('beforeprint', handleBeforePrint);
    }, []);

    const handleToggleSelectMode = () => {
        setSelectMode(prev => {
            const next = !prev;
            if (!next) setSelectedRange(null);
            else setLockedXRange(null);
            return next;
        });
    };

    const handleCancelSelect = () => {
        setSelectMode(false);
        setSelectedRange(null);
    };

    const selectedRangeRef = useRef(null);

    const handleDataZoomEnd = () => {
        const instance = echartsRef.current?.getEchartsInstance();
        if (!instance) return;
        const opt = instance.getOption();
        const dz = opt.dataZoom && opt.dataZoom[0];
        if (!dz) return;

        const startValue = dz.startValue;
        const endValue = dz.endValue;
        if (startValue != null && endValue != null) {
            selectedRangeRef.current = { start: startValue, end: endValue };
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
                    setLockedXRange({ min: range.start, max: range.end });
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
        legend: { data: [getLabel("torque")] },
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
            axisLabel: { formatter: (value) => value.toFixed(3) },
            min: lockedXRange ? lockedXRange.min : null,
            max: lockedXRange ? lockedXRange.max : null,
        },
        yAxis: { type: 'value', name: getLabel("torque"), position: 'left' },
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
                start: 0,
                end: 100,
            },
        ] : [],
        series: [
            {
                name: getLabel("torque"),
                type: 'line',
                showSymbol: false,
                lineStyle: { width: 1 },
                data: chartData.map(d => [d.time, d.torque]),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [chartData, selectMode, lockedXRange]);

    // ---- 关键修复：不再依赖 <ReactECharts notMerge={false}> 的自动合并逻辑，
    // 改为拿到实例后手动 setOption，并显式用 replaceMerge 处理 dataZoom 的增删 ----
    useEffect(() => {
        const instance = echartsRef.current?.getEchartsInstance();
        if (!instance) return;

        instance.setOption(option, {
            notMerge: false,
            lazyUpdate: true,
            replaceMerge: ['dataZoom'], // dataZoom 数组按"整体替换"处理，而不是按下标 merge
        });
    }, [option]);

    const onEvents = useMemo(() => ({
        dataZoomend: handleDataZoomEnd,
        datazoom: handleDataZoomEnd,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <Space style={{ marginBottom: 8 }}>
                <Button type={selectMode ? "primary" : "default"} onClick={handleToggleSelectMode}>
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
                {/* {!selectMode && lockedXRange && (
                    <>
                        <span>
                            {getLabel("time")}: {lockedXRange.min.toFixed(3)} ~ {lockedXRange.max.toFixed(3)}
                        </span>
                        <Button size="small" onClick={() => setLockedXRange(null)}>
                            {t("chart.button.resetView", "恢复全部")}
                        </Button>
                    </>
                )} */}
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