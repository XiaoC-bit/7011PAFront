import React, { useEffect, useState } from "react";
import { Form, InputNumber, Divider, Button, Space, Row, Col, Select, message } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import PubSub from "pubsub-js";
import wsService from "../services/WebSocketService";

const ConfigForm = () => {
    const { t } = useTranslation();

    const targetAngle = Form.useWatch("setAngle");
    const [loadingSet, setLoadingSet] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleSetAngle = async () => {
        try {
            setLoadingSet(true);
            const __channel = "data-testing-message";
            const __type = "prepare-test";
            const data = {
                "__channel": __channel,
                "__type": __type,
                "targetAngle": targetAngle,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, data) => {
                PubSub.unsubscribe(token);
            });
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoadingSet(false);
        }
    };


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
                                addonAfter="mm"
                            />
                        </Form.Item>
                        <Button type="primary" onClick={handleSetAngle} loading={loadingSet}>
                            {t("set")}
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
                        {/* <Col span={12}>
                            <Form.Item label={t("torqueZero")} name="initialLoadTorque">
                                <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={t("angleZero")} name="initialLoadAngle">
                                <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col> */}

                        <Col span={6}>
                            <Form.Item name="initialMode">
                                <Select style={{ width: "100%" }} mode='single'
                                    options={[
                                        { label: t("torque"), value: 'torque' },
                                        { label: t("angle"), value: 'angle' },
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
                                        // { label: t("mm"), value: 'mm' },
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
                                        { label: t("angleZero"), value: 'angleZero' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <h3>{t("startPoint")}</h3></Col>
                        <Col span={12}>
                            <h3>{t("endPoint")}</h3>
                        </Col>
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

                    {/* 其他参数配置项 */}
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
                                        { label: t("return"), value: 1 },
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
