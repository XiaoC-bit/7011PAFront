import React from "react";
import { Form, InputNumber, Divider, Button, Space, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { formState } from '../data/Data';

const ConfigForm = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [formData, setFormData] = useAtom(formState);


    const handleValuesChange = (changedValues, allValues) => {
        setFormData((prevState) => ({
            ...prevState,
            configForm: allValues,
        }));
    };


    return (
        <Form
            className="config-form"
            form={form}
            layout="vertical"
            // initialValues={{
            //     initialLoadTorque: 0,
            //     initialLoadAngle: 0,
            //     initialLoadDisplacement: 0,
            // }}
            initialValues={formData.configForm}
            onValuesChange={handleValuesChange}
        >
            <h3>{t("initialLoad")}</h3>

            {/* 初始载荷配置项 */}
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={t("torqueZero")} name="initialLoadTorque">
                        <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={t("angleZero")} name="initialLoadAngle">
                        <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={t("deformationZero")} name="initialLoadDisplacement">
                        <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <h3>{t("startPoint")}</h3>
            <Form.Item label={t("validTestStart")} name="startPoint">
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <h3>{t("endPoint")}</h3>
            <Form.Item label={t("testEndCondition")} name="endCondition">
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

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
        </Form>
    );
};

export default ConfigForm;
