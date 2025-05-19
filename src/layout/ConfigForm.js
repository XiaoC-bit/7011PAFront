import React, { useEffect } from "react";
import { Form, InputNumber, Divider, Button, Space, Row, Col, Select } from "antd";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { formState } from '../data/Data';
import { isEqual } from 'lodash';

const ConfigForm = () => {
    const { t } = useTranslation();


    return (
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
    );
};

export default ConfigForm;
