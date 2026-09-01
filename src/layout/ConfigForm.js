import React, { useEffect, useRef, useState } from "react";
import { Form, InputNumber, Button, Space, Row, Col, Select, message } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";

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
    const [running,       setRunning]       = useState(false); // 角度调整是否进行中（控制复位按钮 disabled / 设置按钮禁用）
    const [expanded,      setExpanded]      = useState(false);

    // 保存所有 PubSub token，组件卸载时统一清理，防止内存泄漏与回调幽灵触发
    const tokensRef = useRef([]);
    const addToken = (token) => {
        if (token) tokensRef.current.push(token);
    };
    const clearTokens = () => {
        tokensRef.current.forEach((tok) => { try { PubSub.unsubscribe(tok); } catch (_) {} });
        tokensRef.current = [];
    };

    // ==================== 工具：显示后端错误 ====================
    const showBackendError = (data, fallback) => {
        const text = data?.error || fallback || t("operationFailed");
        message.error(text);
    };

    // ==================== ① 设置角度按钮回调 ====================
    //
    // 异步时序：
    //   1) sendMessage(prepare-test)
    //      → 后端 commFunc 立刻 emit 一条 ACK（和原请求字段一致，没有 status 字段）
    //      → 本订阅忽略它（因为我们要等带 status 的完成消息）
    //   2) 后端 timerFunc 异步推进状态机，最终 emit 一条带 status 的消息：
    //        status = "success" / "error" / "canceled"
    //      → 本订阅捕获它，关闭 loading，并根据 status 提示
    //
    // 注意：用户在调整中点击「复位」也会产生一条 status=canceled 的 prepare-test 消息，
    //       所以这里也负责把它一并收尾（关闭 loadingSet + running）。
    //
    const handleSetAngle = async () => {
        if (running || loadingSet) {
            message.warning(t("adjustmentInProgress"));
            return;
        }
        try {
            setLoadingSet(true);
            setRunning(true);

            const data = {
                "__channel": CHANNEL,
                "__type":    TYPE_PREPARE,
                "targetAngle": targetAngle,
            };
            wsService.sendMessage(data);

            // 订阅 prepare-test 对应的响应
            const tok = PubSub.subscribe(TOKEN_PREPARE_RESULT, (_, msg) => {
                // 只处理"带 status 的完成消息"，忽略后端刚受理时的无 status ACK
                const status = msg?.status;
                if (!status) return;

                // 完成消息到达，收尾：取消订阅 + 清理状态
                try { PubSub.unsubscribe(tok); } catch (_) {}
                tokensRef.current = tokensRef.current.filter((t) => t !== tok);

                setLoadingSet(false);
                setRunning(false);

                switch (status) {
                    case "success":
                        message.success(
                            t("adjustAngleSuccess") +
                            (msg.currentAngle !== undefined
                                ? ` (${Number(msg.currentAngle).toFixed(4)}°)`
                                : "")
                        );
                        break;
                    case "canceled":
                        message.info(t("adjustAngleCanceled"));
                        break;
                    case "error":
                    default:
                        showBackendError(msg, t("adjustAngleFailed"));
                        break;
                }
            });
            addToken(tok);
        } catch (error) {
            setLoadingSet(false);
            setRunning(false);
            message.error(error?.message || t("operationFailed"));
        }
    };

    // ==================== ② 复位/停止 按钮回调 ====================
    //
    // 异步时序：
    //   1) sendMessage(cancel-prepare-test)
    //      → 后端 commFunc 返回 accepted / idle，立刻 emit 一条带 status=accepted|idle 的响应
    //      → 本订阅捕获它：
    //          accepted → loadingCancel 保持 true，等待后续 prepare-test.status=canceled
    //          idle     → 没有正在运行的调整，直接关 loadingCancel 并给出错误提示
    //   2) 若 accepted，后端在下一轮 timerFunc 收尾时会再 emit prepare-test.status=canceled
    //      → ① 中已经安装的 prepare-test 订阅会统一捕获它，清 running + loadingSet
    //      → 这里同时也安装一条快捷路径，把 loadingCancel 关掉
    //
    const handleCancelPrepareTest = async () => {
        if (!running || loadingCancel) {
            // 理论上按钮已经 disabled，但防御性判断
            return;
        }
        try {
            setLoadingCancel(true);

            const data = {
                "__channel": CHANNEL,
                "__type":    TYPE_CANCEL,
            };
            wsService.sendMessage(data);

            // 受理 ACK（accepted / idle）
            const tokAck = PubSub.subscribe(TOKEN_CANCEL_ACK, (_, msg) => {
                const status = msg?.status;
                try { PubSub.unsubscribe(tokAck); } catch (_) {}
                tokensRef.current = tokensRef.current.filter((t) => t !== tokAck);

                if (status === "accepted") {
                    // 已受理，保持 loadingCancel = true，等 canceled 完成消息
                    // 下面的 tokDone 订阅会负责收尾
                } else if (status === "idle") {
                    setLoadingCancel(false);
                    message.info(t("noAdjustmentRunning"));
                } else {
                    // 非预期 status
                    setLoadingCancel(false);
                    showBackendError(msg, t("operationFailed"));
                }
            });
            addToken(tokAck);

            // prepare-test canceled 完成消息：和 handleSetAngle 的订阅可能同时触发，没问题
            const tokDone = PubSub.subscribe(TOKEN_PREPARE_RESULT, (_, msg) => {
                if (msg?.status !== "canceled") return;
                try { PubSub.unsubscribe(tokDone); } catch (_) {}
                tokensRef.current = tokensRef.current.filter((t) => t !== tokDone);
                setLoadingCancel(false);
            });
            addToken(tokDone);
        } catch (error) {
            setLoadingCancel(false);
            message.error(error?.message || t("operationFailed"));
        }
    };

    // ==================== 卸载清理：所有订阅统一 unsubscribe ====================
    useEffect(() => {
        return () => clearTokens();
    }, []);

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
                            disabled={!running}   // 没有调整在运行时不允许点复位
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
            >
            </Button>

            {expanded && (
                <>
                    <h3>{t("initialLoad")}</h3>

                    {/* 初始载荷配置项 */}
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
