import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

const TestBaseInfoTableHistory = ({ baseInfo }) => {
    const { t } = useTranslation();

    const [data, setdata] = useState([
        { label: t('specimenName'), value: '', key: 'specimen_name' },
        { label: t('specimenNumber'), value: '', key: 'specimen_number' },
        { label: t('batchNumber'), value: '', key: 'batch_number' },
        { label: t('productionDate'), value: '', key: 'production_date' },
        { label: t('operator'), value: '', key: 'operator' },
        { label: t('labTemperature'), value: '', key: 'lab_temperature' },
        { label: t('labHumidity'), value: '', key: 'lab_humidity' },
        { label: t('group'), value: '', key: 'remarks' },
    ]);


    useEffect(() => {
        if (baseInfo === undefined || baseInfo === null) {
            setdata([]);
            return;
        }
        setdata((prevData) => {
            return prevData.map((item) => {
                const key = item.key;
                const value = baseInfo[key] || '';
                return { ...item, value };
            });
        });

    }, [baseInfo]);



    // 设置列数
    const colsPerRow = 4;

    return (
        <Row gutter={0}>
            {data.map((item, index) => (
                <Col span={24 / colsPerRow} key={index}>
                    <div
                        style={{
                            border: '1px solid #ddd',  // 边框颜色
                            padding: '8px',            // 内边距增加，使内容不紧凑
                            backgroundColor: '#fff',   // 背景颜色可以是白色，像表格一样
                            textAlign: 'left',         // 文字左对齐
                        }}
                    >
                        <strong>{item.label}:</strong> {item.value}
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default TestBaseInfoTableHistory;
