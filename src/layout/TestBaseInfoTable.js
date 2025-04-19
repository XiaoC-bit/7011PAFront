import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { formState } from '../data/Data';

const TestBaseInfoTable = () => {
    const { t } = useTranslation();
    const [formData, _] = useAtom(formState);

    const [data, setdata] = useState([
        { label: t('specimenName'), value: '', key: 'specimenName' },
        { label: t('specimenNumber'), value: '', key: 'specimenNumber' },
        { label: t('batchNumber'), value: '', key: 'batchNumber' },
        { label: t('productionDate'), value: '', key: 'productionDate' },
        { label: t('operator'), value: '', key: 'operator' },
        { label: t('labTemperature'), value: '', key: 'labTemperature' },
        { label: t('labHumidity'), value: '', key: 'labHumidity' },
        { label: t('remarks'), value: '', key: 'remarks' },
    ]);


    useEffect(() => {

        const { configForm, testModeConfig } = formData;
        if (testModeConfig === undefined) return;
        setdata((prevData) => {
            return prevData.map((item) => {
                const key = item.key;
                const value = testModeConfig[key] || configForm[key] || '';
                return { ...item, value };
            });
        });

    }, [formData]);



    // 设置列数
    const colsPerRow = 4;

    return (
        <div >

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
        </div>

    );
};

export default TestBaseInfoTable;
