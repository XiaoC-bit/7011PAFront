import React, { useEffect } from 'react';
import { Form, Row, Col, Input, InputNumber, Select, Radio, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import dayjs from 'dayjs';
import { formState } from '../data/Data';

const { Option } = Select;

const TestModeConfig = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [formData, setFormData] = useAtom(formState);

    useEffect(() => {
        form.setFieldsValue(formData.testModeConfig);
        console.log("formData.testModeConfig:", formData.testModeConfig);
    }, [formData, form]);

    const handleValuesChange = (changedValues, allValues) => {
        setFormData((prevState) => ({
            ...prevState,
            testModeConfig: allValues,
        }));
    };

    const modeOptions = [
        { label: t("destructive_test"), value: "destructive" },
        { label: t("static_test"), value: "static" },
        { label: t("dynamic_test"), value: "dynamic" },
    ];

    return (
        <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
        >
            {/* 试件基本信息 */}
            <h3>{t("specimen_basic_info")}</h3>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={t("specimen_name")} name="specimenName">
                        <Input placeholder={t("input_specimen_name")} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={t("specimen_number")} name="specimenNumber">
                        <Input placeholder={t("input_specimen_number")} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={t("batch_number")} name="batchNumber">
                        <Input placeholder={t("input_batch_number")} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={t("production_date")} name="productionDate" getValueFromEvent={(...[, dateString]) => dateString}
                        getValueProps={(value) => ({ value: value ? dayjs(value, 'YYYY-MM-DD') : undefined })}  >
                        <DatePicker style={{ width: "100%" }} placeholder={t("input_production_date")} format={"YYYY-MM-DD"} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={t("operator")} name="operator">
                        <Input placeholder={t("input_operator")} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={t("lab_temperature")} name="labTemperature">
                        <InputNumber style={{ width: "100%" }} placeholder="℃" />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={t("lab_humidity")} name="labHumidity">
                        <InputNumber style={{ width: "100%" }} placeholder="%" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={t("remarks")} name="remarks">
                        <Input placeholder={t("input_remarks")} />
                    </Form.Item>
                </Col>
            </Row>

            {/* 测试模式选择 */}
            <Form.Item name="mode" initialValue="destructive">
                <Radio.Group options={modeOptions} optionType="button" buttonStyle="solid" />
            </Form.Item>

            <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.mode !== currentValues.mode}>
                {({ getFieldValue }) => {
                    const mode = getFieldValue('mode');
                    return (
                        <>
                            {/* 破坏测试 */}
                            {mode === "destructive" && (
                                <>
                                    <p>{t("torsion_speed")}</p>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="torsionSpeed">
                                                <InputNumber style={{ width: "100%" }} placeholder={t("torsion_speed")} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="torsionUnit" initialValue="degree_per_min">
                                                <Select defaultValue="degree_per_min" style={{ width: "100%" }}>
                                                    <Option value="degree_per_min">{t("degree_per_min")}</Option>
                                                    <Option value="n_per_min">{t("n_per_min")}</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* 静态测试 */}
                            {mode === "static" && (
                                <>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <p>{t("mode_selection")}</p>
                                            <Form.Item name="staticMode" initialValue="angle">
                                                <Select style={{ width: "100%" }} placeholder={t("select_mode")}>
                                                    <Option value="angle">{t("constant_angle_mode")}</Option>
                                                    <Option value="torque">{t("constant_torque_mode")}</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.staticMode !== currentValues.staticMode}>
                                                {({ getFieldValue }) => {
                                                    const staticMode = getFieldValue('staticMode');
                                                    return (
                                                        <>
                                                            {staticMode === "angle" && (
                                                                <>
                                                                    <p>{t("constant_angle")}</p>
                                                                    <Form.Item name="constantAngle">
                                                                        <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_angle")} />
                                                                    </Form.Item>
                                                                </>
                                                            )}
                                                            {staticMode === "torque" && (
                                                                <>
                                                                    <p>{t("constant_torque")}</p>
                                                                    <Form.Item name="constantTorque">
                                                                        <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_torque")} />
                                                                    </Form.Item>
                                                                </>
                                                            )}
                                                        </>
                                                    );
                                                }}
                                            </Form.Item>
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
                                            <Form.Item name="torsionSpeed">
                                                <InputNumber style={{ width: "100%" }} placeholder={t("torsion_speed")} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name="torsionUnit">
                                                <Select defaultValue="degree_per_min" style={{ width: "100%" }}>
                                                    <Option value="degree_per_min">{t("degree_per_min")}</Option>
                                                    <Option value="n_per_min">{t("n_per_min")}</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} >
                                            <Form.Item name="cycleCount">
                                                <InputNumber style={{ width: "100%" }} placeholder={t("input_cycle_count")} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <p>{t("delay_time") + "(ms)"}</p>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Form.Item name="delayTime">
                                                <InputNumber style={{ width: "100%" }} placeholder={t("delay_time")} />
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
                                            <Form.Item name="dynamicMode" initialValue="sin">
                                                <Select style={{ width: "100%" }} placeholder={t("select_waveform")}>
                                                    <Option value="sin">{t("sin_waveform")}</Option>
                                                    <Option value="triangle">{t("triangle_waveform")}</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>  <Form.Item name="staticMode" initialValue="angle">
                                            <Select style={{ width: "100%" }} placeholder={t("select_mode")}>
                                                <Option value="angle">{t("constant_angle_mode")}</Option>
                                                <Option value="torque">{t("constant_torque_mode")}</Option>
                                            </Select>
                                        </Form.Item>
                                        </Col>
                                    </Row>


                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.staticMode !== currentValues.staticMode}>
                                                {({ getFieldValue }) => {
                                                    const staticMode = getFieldValue('staticMode');
                                                    return (
                                                        <>
                                                            {staticMode === "angle" && (
                                                                <>
                                                                    <p>{t("constant_angle")}</p>
                                                                    <Form.Item name="constantAngle">
                                                                        <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_angle")} />
                                                                    </Form.Item>
                                                                </>
                                                            )}
                                                            {staticMode === "torque" && (
                                                                <>
                                                                    <p>{t("constant_torque")}</p>
                                                                    <Form.Item name="constantTorque">
                                                                        <InputNumber style={{ width: "100%" }} placeholder={t("input_constant_torque")} />
                                                                    </Form.Item>
                                                                </>
                                                            )}
                                                        </>
                                                    );
                                                }}
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <p>{t("torsion_frequency")}</p>
                                            <Form.Item name="torsionFrequency">
                                                <InputNumber style={{ width: "100%" }} placeholder="HZ" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.dynamicMode !== currentValues.dynamicMode}>
                                                {({ getFieldValue }) => {
                                                    const dynamicMode = getFieldValue('dynamicMode');
                                                    return (
                                                        <>
                                                            {dynamicMode === "triangle" && (
                                                                <>
                                                                    <p>{t("step_time")}</p>
                                                                    <Form.Item name="stepTime">
                                                                        <InputNumber style={{ width: "100%" }} placeholder="ms" />
                                                                    </Form.Item>
                                                                </>
                                                            )}
                                                        </>
                                                    );
                                                }}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </>
                    );
                }}
            </Form.Item>
        </Form>
    );
};

export default TestModeConfig;