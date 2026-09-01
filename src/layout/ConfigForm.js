import React, { useEffect, useRef, useState } from "react";
import { Form, InputNumber, Button, Space, Row, Col, Select, message } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";

// ============ 后端 WS 协议常量 ============
// 前端永远发送/订阅 data-testing-message（TestingHandler 透明处理后再把响应通道还原）
const CHANNEL = "data-testing-message";
const TYPE_PREPARE = "prepare-test";
const TYPE_CANCEL  = "cancel-prepare-test";
const TOKEN_PREPARE_RESULT = `${CHANNEL}-${TYPE_PREPARE}`;
const TOKEN_CANCEL_ACK     = `${CHANNEL}-${TYPE_CANCEL}`;

const ConfigForm = () => {
    const { t } = useTranslation();

    const targetAngle = Form.useWatch("setAngle");

    const [loadingSet,    setLoadingSet]    = useState(false); // 设置角度按钮 loading
    const [loadingCancel, setLoadingCancel] = useState(false); // 复位按钮 loading
    const [running,       setRunning]       = useState(false); // 是否有正在进行的角度调整
    const [expanded,      setExpanded]      = useState(false);

    // ========== 订阅 token 管理：组件卸载时统一 unsubscribe ==========
    const tokensRef = useRef([]);
    const addToken = (token) => { if (token) tokensRef.current.push(token); };
    const unsubscribeAll = () => {
        tokensRef.current.forEach((tok) => { try { PubSub.unsubscribe(tok); } catch (_) {} });
        tokensRef.current = [];
    };
    const removeToken = (tok) => {
        try { PubSub.unsubscribe(tok); } catch (_) {}
        tokensRef.current = tokensRef.current.filter((t) => t !== tok);
    };

    // ========== 收尾门禁：同一轮任务只允许被收尾一次 ==========
    // 解决：prepare 的「canceled 订阅」和 cancel 回调的「canceled 订阅」可能同时被一条 status=canceled 消息触发
    //       两者都想关 loading、写 running —— 用 finishedRef 做 CAS，保证只有第一个生效
    const finishedRef = useRef(true);
    const markStart = () => { finishedRef.current = false; };
    const tryMarkFinish = () => {
        if (finishedRef.current) return false;
        finishedRef.current = true;
        return true;
    };

    // ========== 统一收尾：把所有状态恢复到非运行态 ==========
    const finalizeAll = () => {
        if (!tryMarkFinish()) return; // 已经被收尾过了，直接跳过
        setLoadingSet(false);
        setLoadingCancel(false);
        setRunning(false);
    };

    // ========== 工具：显示后端错误 ==========
    const showBackendError = (data, fallback) => {
        const text = data?.error || fallback || t("operationFailed");
        message.error(text);
    };

    // ==================== ① 设置角度按钮回调 ====================
    const handleSetAngle = async () => {
        if (running || loadingSet) {
            message.warning(t("adjustmentInProgress"));
            return;
        }
        try {
            setLoadingSet(true);
            setRunning(true);
            markStart(); // 开启收尾门禁

            wsService.sendMessage({
                "__channel":   CHANNEL,
                "__type":      TYPE_PREPARE,
                "targetAngle": targetAngle,
            });

            // 订阅 prepare-test 结果：包含 success / error / canceled 三种完成情况
            const tok = PubSub.subscribe(TOKEN_PREPARE_RESULT, (_, msg) => {
                const status = msg?.status;
                // 忽略后端"刚受理"时的无 status ACK
                if (!status) return;

                removeToken(tok);

                switch (status) {
                    case "success":
                        finalizeAll();
                        message.success(
                            t("adjustAngleSuccess") +
                            (msg.currentAngle !== undefined
                                ? ` (${Number(msg.currentAngle).toFixed(4)}°)`
                                : "")
                        );
                        break;
                    case "canceled":
                        finalizeAll();
                        message.info(t("adjustAngleCanceled"));
                        break;
                    case "error":
                    default:
                        finalizeAll();
                        showBackendError(msg, t("adjustAngleFailed"));
                        break;
                }
            });
            addToken(tok);
        } catch (error) {
            finalizeAll();
            message.error(error?.message || t("operationFailed"));
        }
    };

    // ==================== ② 复位/停止 按钮回调 ====================
    //
    // 时序：
    //   sendMessage(cancel-prepare-test)
    //     → TestingHandler 不做数据库，直接转发给设备线程 ControlTestCommHandler
    //     → commFunc 立刻 emit ACK (data-testing-message/cancel-prepare-test status=accepted|idle)
    //       若 accepted：保持 loadingCancel，等 prepare-test.status=canceled 到达（与上面的 prepare 完成回调竞争 finalizeAll）
    //       若 idle    ：没有任务在运行，立刻 finalizeAll + message.info
    //
    const handleCancelPrepareTest = async () => {
        if (!running || loadingCancel) return;
        try {
            setLoadingCancel(true);

            wsService.sendMessage({
                "__channel": CHANNEL,
                "__type":    TYPE_CANCEL,
            });

            // ACK：accepted / idle
            const tokAck = PubSub.subscribe(TOKEN_CANCEL_ACK, (_, msg) => {
                const status = msg?.status;
                removeToken(tokAck);

                if (status === "accepted") {
                    // 已受理，保持 loadingCancel 显示
                    // canceled 完成消息由 handleSetAngle 订阅 + 下方 tokDone 订阅竞争处理，
                    // 最终通过 finalizeAll 的 CAS 门禁只收尾一次。
                    return;
                }
                if (status === "idle") {
                    // 后端认为当前没有进行中的调整，和前端 running=true 不一致。
                    // 这里做纠正：把前端状态一次性恢复干净。
                    finalizeAll();
                    message.info(t("noAdjustmentRunning"));
                    return;
                }
                // 非预期状态
                finalizeAll();
                showBackendError(msg, t("operationFailed"));
            });
            addToken(tokAck);

            // canceled 完成消息「兜底订阅」：
            // 当 handleSetAngle 的订阅因为"被取消了所以没装"（极端情况）或其它原因没启动时，
            // 这里作为兜底，保证 canceled 一到就 finalizeAll。
            // CAS 门禁 finalizeAll 会让"两个订阅同时触发"安全合并。
            const tokDone = PubSub.subscribe(TOKEN_PREPARE_RESULT, (_, msg) => {
                if (msg?.status !== "canceled") return;
                removeToken(tokDone);
                finalizeAll();
            });
            addToken(tokDone);
        } catch (error) {
            finalizeAll();
            message.error(error?.message || t("operationFailed"));
        }
    };

    // ==================== 组件卸载清理 ====================
    useEffect(() => () => unsubscribeAll(), []);

    // ==================== 渲染 ====================
    return (
        <>
            <Row gutter={16}>
                <Col span={24}>
                    <h3>{t("setAngle")}</h3>
                    <Space.Compact style={{ width: "100%" }}>
                        <Form.Item name="setAngle" noStyle>
                            <InputNumber
                                min={0}
                                step={0.0001}
                                precision={4}
                                style={{ width: "100%" }}
                                addonAfter="°"
                                disabled={loadingSet || running}
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            onClick={handleSetAngle}
                            loading={loadingSet}
                            disabled={running && !loadingSet}
                        >
                            {t("set")}
                        </Button>
                        <Button
                            danger
                            onClick={handleCancelPrepareTest}
                            loading={loadingCancel}
                            disabled={!running}
                        >
                            {t("resetStop")}
                        </Button>
                    </Space.Compact>
                </Col>
            </Row>

            <Button
                type="link"
                onClick={() => setExpanded(!expanded)}
                icon={expanded ? <UpOutlined /> : <DownOutlined />}
                style={{ paddingLeft: 0 }}
            />

            {expanded && (
                <>
                    <h3>{t("initialLoad")}</h3>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="initialMode">
                                <Select style={{ width: "100%" }} mode='single'
                                    options={[
                                        { label: t("torque"), value: 'torque' },
                                        { label: t("angle"),  value: 'angle' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="initialLoadValue">
                                <InputNumber min={-10} step={0.01} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="unit">
                                <Select style={{ width: "100%" }} mode='single'
                                    disabled
                                    options={[
                                        { label: t("N.m"), value: 'N.m' },
                                        { label: t("N.m"), value: 'N' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="zeroMode">
                                <Select style={{ width: "100%" }} mode='multiple'
                                    options={[
                                        { label: t("torqueZero"), value: 'torqueZero' },
                                        { label: t("angleZero"),  value: 'angleZero' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}><h3>{t("startPoint")}</h3></Col>
                        <Col span={12}><h3>{t("endPoint")}</h3></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={t("validTestStart")} name="startPoint">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("testEndCondition")} name="endCondition">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <h3>{t("otherParams")}</h3>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={t("maxTorque")} name="maxTorque">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("maxAngle")} name="maxAngle">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={t("breakSensitivity")} name="breakSensitivity">
                                <InputNumber min={0} max={100} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("moveSpeed")} name="moveSpeed">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={t("specimenReturn")} name="specimenReturn">
                                <Select style={{ width: "100%" }} mode='single'
                                    options={[
                                        { label: t("return"),    value: 1 },
                                        { label: t("no-return"), value: 0 },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
};

export default ConfigForm;
