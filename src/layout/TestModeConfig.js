import React, { useState } from "react";
import { Row, Col, Radio, Input, InputNumber, Select, DatePicker, Divider, Form } from "antd";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { formState } from '../data/Data';

const { Option } = Select;

const TestModeConfig = () => {
    const { Option } = Select;
    const { TextArea } = Input;
    const { t } = useTranslation();


    const [form] = Form.useForm();
    const [formData, setFormData] = useAtom(formState);
    const handleValuesChange = (changedValues, allValues) => {
        console.log("changedValues", changedValues);
        console.log("allValues", allValues);
        setFormData((prevState) => ({
            ...prevState,
            configForm: allValues,
        }));
    };

    const [mode, setMode] = useState("destructive"); // 默认模式：破坏测试
    const [staticMode, setStaticMode] = useState("angle"); // 默认静态测试模式：恒角度模式
    const [dynamicMode, setDynamicMode] = useState("sin"); // 默认动态测试模式：正弦波形
    // 测试模式选项
    const modeOptions = [
        { label: t("destructive_test"), value: "destructive" },
        { label: t("static_test"), value: "static" },
        { label: t("dynamic_test"), value: "dynamic" },
    ];

    return (
        <div className='test-mode-config'>
            {/* 试件基本信息 */}
            <h3>{t("specimen_basic_info")}</h3>
            <Form
                form={form}
                layout="vertical"
                initialValues={formData.testModeConfig}
                onValuesChange={handleValuesChange}
            >
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

            <Divider style={{ marginBottom: 10 }} />
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

                    <Row gutter={16}>
                        <Col span={12}>
                            <p>{t("mode_selection")}</p>
                        </Col>
                        <Col span={12}>
                            {staticMode === "angle" && (
                                <>
                                    <p>{t("constant_angle")}</p>
                                </>
                            )}
                            {staticMode === "torque" && (
                                <>
                                    <p>{t("constant_torque")}</p>
                                </>
                            )}

                        </Col>
                    </Row>
                    <Row gutter={16}>

                        <Col span={12}>
                            <Form.Item>
                                <Select style={{ width: "100%" }} placeholder={t("select_mode")}
                                    value={staticMode}
                                    onChange={(value) => setStaticMode(value)}
                                >
                                    <Option value="angle">{t("constant_angle_mode")}</Option>
                                    <Option value="torque">{t("constant_torque_mode")}</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            {staticMode === "angle" && (
                                <>

                                    <Form.Item>
                                        <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_angle")} />
                                    </Form.Item>
                                </>
                            )}
                            {staticMode === "torque" && (
                                <>
                                    <Form.Item>
                                        <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_torque")} />
                                    </Form.Item>
                                </>
                            )}
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={12}>

                            <p>{t("torsion_speed")}</p>
                        </Col>
                        <Col span={12}>

                            <p>{t("cycle_count")}</p>
                        </Col>

                    </Row>
                    <Row gutter={16}>

                        <Col span={6}>

                            <Form.Item>
                                <InputNumber style={{ width: "100%" }} placeholder={t("torsion_speed")} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                <Select defaultValue="degree_per_min" style={{ width: "100%" }}>
                                    <Option value="degree_per_min">{t("degree_per_min")}</Option>
                                    <Option value="n_per_min">{t("n_per_min")}</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>

                            <Form.Item>
                                <InputNumber style={{ width: "100%" }} placeholder={t("input_cycle_count")} />
                            </Form.Item>
                        </Col>
                    </Row>

                </>
            )}
            {/* 动态测试 */}
            {mode === "dynamic" && (
                <>

                    <Row gutter={16}>
                        <Col span={12}>
                            <p>{t("waveform_selection")}</p>
                        </Col>
                        <Col span={12}>

                            <p>{t("mode_selection")}</p>
                        </Col>
                    </Row>



                    <Row gutter={16}>
                        <Col span={12}>
                            <Select style={{ width: "100%" }} placeholder={t("select_waveform")}
                                vlaue={dynamicMode}
                                defaultValue={dynamicMode}
                                onChange={(value) => {
                                    setDynamicMode(value);
                                }}
                            >
                                <Option value="sin">{t("sin_waveform")}</Option>
                                <Option value="triangle">{t("triangle_waveform")}</Option>
                            </Select>
                        </Col>
                        <Col span={12}>
                            <Select style={{ width: "100%" }} placeholder={t("select_mode")}
                                value={staticMode}
                                onChange={(value) => setStaticMode(value)}
                            >
                                <Option value="angle">{t("constant_angle_mode")}</Option>
                                <Option value="torque">{t("constant_torque_mode")}</Option>
                            </Select>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={12}>
                            {staticMode === "angle" && (
                                <>
                                    <p>{t("constant_angle")}</p>
                                </>
                            )}
                            {staticMode === "torque" && (
                                <>
                                    <p>{t("constant_torque")}</p>
                                </>
                            )}
                        </Col>
                        <Col span={12}>


                            <p>{t("torsion_frequency")}</p>

                        </Col>
                    </Row>




                    <Row gutter={16}>
                        <Col span={12}>   {staticMode === "angle" && (
                            <>
                                <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_angle")} />
                            </>
                        )} {staticMode === "torque" && (
                            <>
                                <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_torque")} />
                            </>
                        )}

                        </Col>
                        <Col span={12}>


                            <InputNumber style={{ width: "100%" }} placeholder="HZ" />
                        </Col>
                    </Row>




                    {dynamicMode === "triangle" && (
                        <>
                            <p>{t("step_time")}</p>
                            <InputNumber style={{ width: "100%" }} placeholder="ms" />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default TestModeConfig;
