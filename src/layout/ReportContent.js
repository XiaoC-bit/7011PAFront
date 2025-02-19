import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import MyLineChart from './ReportChart';
import { SwapOutlined, PlayCircleOutlined } from '@ant-design/icons';

import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';
import '../styles/layout.css';

const ReportContent = () => {
    const { t } = useTranslation();
    const printRef = useRef();

    const basicInfoData = [
        { key: '1', label: t('specimenName'), value: 'Specimen 1' },
        { key: '2', label: t('specimenNumber'), value: '001' },
        { key: '3', label: t('batchNumber'), value: 'Batch 1' },
        { key: '4', label: t('productionDate'), value: '2023-01-01' },
        { key: '5', label: t('operator'), value: 'Operator 1' },
        { key: '6', label: t('labTemperature'), value: '25°C' },
        { key: '7', label: t('labHumidity'), value: '60%' },
        { key: '8', label: t('remarks'), value: 'Remark 1' },
    ];

    const testData = [
        { key: '1', label: t('maxTorque'), value: '100 Nm' },
        { key: '2', label: t('maxAngle'), value: '45°' },
        { key: '3', label: t('torsionalStiffness'), value: '200 Nm/°' },
    ];
    const TransferDFSet = () => {

    };

    const StartTest = () => {
        try {
            const __channel = "control-message";
            const __type = "start-test";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                if (data.status === 'success') {
                    //message.success(t('spin success'));
                } else {
                    message.error(t('spin failed'));
                }
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
            <div className="printableArea" ref={printRef} style={{ flex: 1, width: '100%', maxWidth: '1200px', marginBottom: '16px' }}>
                <table style={{ width: '100%', fontSize: 15, borderCollapse: 'collapse', display: "none" }}>
                    <tbody>
                        {basicInfoData.reduce((rows, item, index) => {
                            if (index % 3 === 0) rows.push([]);
                            rows[rows.length - 1].push(item);
                            return rows;
                        }, []).map((row, rowIndex) => {
                            return <tr key={rowIndex}>
                                {row.map((item, colIndex) => {
                                    return <React.Fragment key={item.key}>
                                        <td style={{ border: '1px solid #d9d9d9', padding: '5px', width: '16.66%', }}>{item.label}</td>
                                        <td style={{ border: '1px solid #d9d9d9', padding: '5px', width: '16.66%' }}>{item.value}</td>
                                    </React.Fragment>;
                                }

                                )}
                            </tr>;
                        }


                        )}
                    </tbody>
                </table>
                <div style={{ width: '100%', marginTop: '16px' }}>
                    <MyLineChart height={400} />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', fontSize: 15 }}>
                    <thead>
                        <tr>
                            {testData.map(item => (
                                <th key={item.key} className='header' style={{ border: '1px solid #d9d9d9', padding: '5px' }}>{item.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {testData.map(item => (
                                <td key={item.key} style={{ border: '1px solid #d9d9d9', padding: '5px' }}>{item.value}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{ textAlign: 'right', width: '100%', maxWidth: '1200px', padding: '16px' }}>
                <Button
                    onClick={TransferDFSet}
                    icon={<SwapOutlined />}
                    style={{
                        marginRight: '16px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#1890ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    {t('transfer method')}
                </Button>
                <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#52c41a',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                    onClick={StartTest}
                >
                    {t('startTest')}
                </Button>
            </div>
        </div>
    );
};

export default ReportContent;