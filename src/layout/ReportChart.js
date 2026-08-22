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

    // ---- 修改：lockedXRange 仍然记录选中的原始范围，用于展示文案和提交参数 ----
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
            // ---- 修改：只在拖动选择过程中暂停轮询，避免正在选择时数据刷新打断拖动 ----
            // 提交/取消后应该恢复正常轮询
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

    // ---- 关键修改：真正用于画图的数据源，如果有锁定范围，就在数据层面裁剪，
    // 而不是只调 xAxis.min/max。这样 slider 缩略图、主图、X轴范围三者天然一致 ----
    const displayData = useMemo(() => {
        if (!lockedXRange) return chartData;
        return chartData.filter(d => d.time >= lockedXRange.min && d.time <= lockedXRange.max);
    }, [chartData, lockedXRange]);

       // ---- 修改：xRange 现在始终基于 displayData 计算，不再只在 lockedXRange 存在时才生效 ----
    const xRange = useMemo(() => {
        if (displayData.length === 0) return { min: null, max: null };
        const times = displayData.map(d => d.time);
        return {
            min: Math.min(...times),
            max: Math.max(...times),
        };
    }, [displayData]);

    

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
            // ---- 修改：始终使用真实数据边界，不再依赖 lockedXRange 判断 ----
            min: xRange.min,
            max: xRange.max,
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
                data: displayData.map(d => [d.time, d.torque]),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [displayData, selectMode, lockedXRange, xRange]);


    const onEvents = useMemo(() => ({
        dataZoomend: handleDataZoomEnd,
        datazoom: handleDataZoomEnd,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

      const prevSelectModeRef = useRef(selectMode);

    useEffect(() => {
        const wasSelecting = prevSelectModeRef.current;
        prevSelectModeRef.current = selectMode;

        if (wasSelecting && !selectMode) {
            const instance = echartsRef.current?.getEchartsInstance();
            if (instance) {
                instance.setOption(option, { notMerge: true, lazyUpdate: true });
            }
        }
    }, [selectMode, option]);


    

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
                {!selectMode && lockedXRange && (
                    <span>
                        {getLabel("time")}: {lockedXRange.min.toFixed(3)} ~ {lockedXRange.max.toFixed(3)}
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