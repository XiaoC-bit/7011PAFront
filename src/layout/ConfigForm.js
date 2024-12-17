import React from "react";
import { Form, InputNumber, Divider, Button, Space, Row, Col } from "antd";
import { useTranslation } from "react-i18next";

const ConfigForm = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                initialLoadTorque: 0,
                initialLoadAngle: 0,
                initialLoadDisplacement: 0,
            }}
        >
            <Divider>{t("initialLoad")}</Divider>

            {/* 初始载荷配置项 */}
            <Row gutter={24}>
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

            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item label={t("deformationZero")} name="initialLoadDisplacement">
                        <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider>{t("startPoint")}</Divider>
            <Form.Item label={t("validTestStart")} name="startPoint">
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Divider>{t("endPoint")}</Divider>
            <Form.Item label={t("testEndCondition")} name="endCondition">
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Divider>{t("otherParams")}</Divider>

            {/* 其他参数配置项 */}
            <Row gutter={24}>
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

            <Row gutter={24}>
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

            <Divider />
            <Space>
                <Button type="primary" htmlType="submit">
                    {t("save")}
                </Button>
                <Button htmlType="reset">{t("reset")}</Button>
            </Space>
        </Form>
    );
};

export default ConfigForm;
