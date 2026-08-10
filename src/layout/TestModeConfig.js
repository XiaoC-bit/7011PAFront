import React, { useEffect } from 'react';
import { Form, Row, Col, Input, InputNumber, Select, Radio, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import { isFirstCreateMethodState, hasChangeMethodState } from '../data/Data';

const { Option } = Select;

const TestModeConfig = () => {
    const { t } = useTranslation();

    const [isFirstCreateMethod, setIsFirstCreateMethod] = useAtom(isFirstCreateMethodState);

    const modeOptions = [
        { label: t("destructive_test"), value: "destructive" },
        { label: t("static_test"), value: "static" },
        { label: t("dynamic_test"), value: "dynamic" },
    ];

    return (
        <>
            {/* 试件基本信息 */}
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
                    <Form.Item label={t("group")} name="remarks">
                        <Input placeholder={t("input_remarks")} />
                    </Form.Item>
                </Col>
            </Row>

        </>
    );
};

export default TestModeConfig;