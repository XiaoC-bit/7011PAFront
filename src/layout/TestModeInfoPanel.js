import React from 'react';
import { Card, Descriptions, Divider, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const TestModeInfoPanel = ({ formData }) => {
    const { t } = useTranslation();

    if (!formData) {
        return <Card title={t("test_configuration")}><p>{t("no_data_available")}</p></Card>;
    }

    const {
        specimenName,
        specimenNumber,
        batchNumber,
        productionDate,
        operator,
        labTemperature,
        labHumidity,
        remarks,
        mode,
        // Destructive test fields
        torsionSpeed,
        torsionUnit,
        direction,
        // Static test fields
        staticMode,
        constantAngle,
        constantTorque,
        cycleCount,
        delayTime,
        // Dynamic test fields
        dynamicMode,
        torsionFrequency,
        stepTime,
        // Initial load fields
        initialMode,
        initialLoadValue,
        zeroMode,
        startPoint,
        endCondition,
        maxTorque,
        maxAngle,
        breakSensitivity,
        moveSpeed
    } = formData;

    const renderModeSpecificInfo = () => {
        switch (mode) {
            case 'destructive':
                return (
                    <>
                        <Descriptions.Item label={t("torsion_speed")}>
                            {torsionSpeed} {torsionUnit === 'degree_per_min' ? t("degree_per_min") : t("n_per_min")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("direction")}>
                            {direction === 'Forward' ? t("Forward") : t("Backward")}
                        </Descriptions.Item>
                    </>
                );
            case 'static':
                return (
                    <>
                        <Descriptions.Item label={t("mode")}>
                            {staticMode === 'angle' ? t("constant_angle_mode") : t("constant_torque_mode")}
                        </Descriptions.Item>
                        {staticMode === 'angle' ? (
                            <Descriptions.Item label={t("constant_angle")}>
                                {constantAngle}
                            </Descriptions.Item>
                        ) : (
                            <Descriptions.Item label={t("constant_torque")}>
                                {constantTorque}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label={t("torsion_speed")}>
                            {torsionSpeed} {torsionUnit === 'degree_per_min' ? t("degree_per_min") : t("n_per_min")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("cycle_count")}>
                            {cycleCount}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("delay_time")}>
                            {delayTime} ms
                        </Descriptions.Item>
                    </>
                );
            case 'dynamic':
                return (
                    <>
                        <Descriptions.Item label={t("waveform")}>
                            {dynamicMode === 'sin' ? t("sin_waveform") : t("triangle_waveform")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("mode")}>
                            {staticMode === 'angle' ? t("constant_angle_mode") : t("constant_torque_mode")}
                        </Descriptions.Item>
                        {staticMode === 'angle' ? (
                            <Descriptions.Item label={t("constant_angle")}>
                                {constantAngle}
                            </Descriptions.Item>
                        ) : (
                            <Descriptions.Item label={t("constant_torque")}>
                                {constantTorque}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label={t("torsion_frequency")}>
                            {torsionFrequency} Hz
                        </Descriptions.Item>
                        <Descriptions.Item label={t("cycle_count")}>
                            {cycleCount}
                        </Descriptions.Item>
                        {dynamicMode === 'triangle' && (
                            <Descriptions.Item label={t("step_time")}>
                                {stepTime} ms
                            </Descriptions.Item>
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Card title={t("test_configuration")} style={{ maxHeight: '768px', overflow: 'auto' }}>
            {/* Specimen Basic Info */}
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t("specimen_name")}>{specimenName}</Descriptions.Item>
                <Descriptions.Item label={t("specimen_number")}>{specimenNumber}</Descriptions.Item>
                <Descriptions.Item label={t("batch_number")}>{batchNumber}</Descriptions.Item>
                <Descriptions.Item label={t("production_date")}>
                    {productionDate ? dayjs(productionDate).format('YYYY-MM-DD') : ''}
                </Descriptions.Item>
                <Descriptions.Item label={t("operator")}>{operator}</Descriptions.Item>
                <Descriptions.Item label={t("lab_temperature")}>
                    {labTemperature} ℃
                </Descriptions.Item>
                <Descriptions.Item label={t("lab_humidity")}>
                    {labHumidity} %
                </Descriptions.Item>
                <Descriptions.Item label={t("remarks")}>{remarks}</Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Test Mode */}
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t("test_mode")}>
                    <Tag color="blue">
                        {mode === 'destructive'
                            ? t("destructive_test")
                            : mode === 'static'
                                ? t("static_test")
                                : t("dynamic_test")}
                    </Tag>
                </Descriptions.Item>
                {renderModeSpecificInfo()}
            </Descriptions>

            <Divider />

            {/* Initial Load Configuration */}
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t("initial_load")}>
                    {initialLoadValue} {initialMode === 'torque' ? 'N.m' : '°'}
                </Descriptions.Item>
                <Descriptions.Item label={t("zero_mode")}>
                    {zeroMode?.includes('torqueZero') && <Tag>{t("torqueZero")}</Tag>}
                    {zeroMode?.includes('angleZero') && <Tag>{t("angleZero")}</Tag>}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Test Points */}
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t("start_point")}>{startPoint}</Descriptions.Item>
                <Descriptions.Item label={t("end_condition")}>{endCondition}</Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Other Parameters */}
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t("max_torque")}>{maxTorque} N.m</Descriptions.Item>
                <Descriptions.Item label={t("max_angle")}>{maxAngle} °</Descriptions.Item>
                <Descriptions.Item label={t("break_sensitivity")}>
                    {breakSensitivity} %
                </Descriptions.Item>
                <Descriptions.Item label={t("move_speed")}>{moveSpeed}</Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default TestModeInfoPanel;