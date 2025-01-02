import React, { useState } from "react";
import { Row, Col, Radio, Input, InputNumber, Select, DatePicker, Divider, Form } from "antd";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const TestModeConfig = () => {
    const { Option } = Select;
    const { TextArea } = Input;
    const { t } = useTranslation();
    const [mode, setMode] = useState("destructive"); // 默认模式：破坏测试

    // 测试模式选项
    const modeOptions = [
        { label: t("destructive_test"), value: "destructive" },
        { label: t("static_test"), value: "static" },
        { label: t("dynamic_test"), value: "dynamic" },
    ];

    return (
        <div >
            {/* 试件基本信息 */}
            <h3>{t("specimen_basic_info")}</h3>
            <Form layout="vertical">
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label={t("specimen_name")}>
                            <Input placeholder={t("input_specimen_name")} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={t("specimen_number")}>
                            <Input placeholder={t("input_specimen_number")} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label={t("batch_number")}>
                            <Input placeholder={t("input_batch_number")} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={t("production_date")}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label={t("operator")}>
                            <Input placeholder={t("input_operator")} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={t("lab_temperature")}>
                            <InputNumber style={{ width: "100%" }} placeholder="℃" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label={t("lab_humidity")}>
                            <InputNumber style={{ width: "100%" }} placeholder="%" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={t("remarks")}>
                            <Input placeholder={t("input_remarks")} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <Divider style={{ margin: 20 }} />
            {/* 模式选择 */}
            <Radio.Group
                options={modeOptions}
                onChange={(e) => setMode(e.target.value)}
                value={mode}
                optionType="button"
                buttonStyle="solid"
            />

            {/* 破坏测试 */}
            {mode === "destructive" && (
                <>
                    <p>{t("input_project")}</p>
                    <div style={{
                        display: 'flex',
                        alignItems: "center",
                    }}>
                        <InputNumber style={{ flex: 1 }} placeholder={t("torsion_speed")} />
                        <Select defaultValue="degree_per_min" style={{ flex: '0 0 20%', marginLeft: '8px' }}>
                            <Option value="degree_per_min">{t("degree_per_min")}</Option>
                            <Option value="n_per_min">{t("n_per_min")}</Option>
                        </Select>
                    </div>
                </>
            )}

            {/* 静态测试 */}
            {mode === "static" && (
                <>
                    <p>{t("mode_selection")}</p>
                    <Select style={{ width: "100%" }} placeholder={t("select_mode")}>
                        <Option value="angle">{t("constant_angle_mode")}</Option>
                        <Option value="torque">{t("constant_torque_mode")}</Option>
                    </Select>
                    <p>{t("constant_angle")}</p>
                    <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_angle")} />
                    <p>{t("torsion_speed")}</p>
                    <InputNumber style={{ width: "100%" }} placeholder={t("input_torsion_speed")} />
                    <p>{t("cycle_count")}</p>
                    <InputNumber style={{ width: "100%" }} placeholder={t("input_cycle_count")} />
                </>
            )}

            {/* 动态测试 */}
            {mode === "dynamic" && (
                <>
                    <p>{t("waveform_selection")}</p>
                    <Select style={{ width: "100%" }} placeholder={t("select_waveform")}>
                        <Option value="sin">{t("sin_waveform")}</Option>
                        <Option value="triangle">{t("triangle_waveform")}</Option>
                    </Select>
                    <p>{t("torsion_frequency")}</p>
                    <InputNumber style={{ width: "100%" }} placeholder="HZ" />
                    <p>{t("step_time")}</p>
                    <InputNumber style={{ width: "100%" }} placeholder="ms" />
                </>
            )}
        </div>
    );
};

export default TestModeConfig;
