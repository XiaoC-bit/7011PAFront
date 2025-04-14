import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import MyLineChart from './ReportChart';
import { formState } from '../data/Data';
import { useAtom } from 'jotai';
import { SwapOutlined, PlayCircleOutlined, PauseCircleOutlined, ExportOutlined } from '@ant-design/icons';
import TestBaseInfoTable from './TestBaseInfoTable';
import ResultInfoTable from './ResultInfoTable';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';
import '../styles/layout.css';

const TestingContent = () => {
    const { t } = useTranslation();
    const printRef = useRef();
    const [formData] = useAtom(formState);

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

    const checkFormData = () => {
        const { configForm, testModeConfig } = formData;
        const isComplete = configForm && Object.keys(configForm).length > 0 && testModeConfig && Object.keys(testModeConfig).length > 0;
        return isComplete;
    };

    const TransferDFSet = () => {
        const isComplete = checkFormData();
        if (!isComplete) {
            message.warning(t('pleaseCompleteForm'));
            return;
        }

        const { configForm, testModeConfig } = formData;

        try {
            const __channel = "data-testing-message";
            const __type = "transfer-method";
            const data = {
                "__channel": __channel,
                "__type": __type,
                configForm,
                testModeConfig,
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

    const EndTest = () => {
        try {
            const __channel = "control-message";
            const __type = "end-test";
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

    const exportData = () => {
        try {
            const __channel = "report-message";
            const __type = "export-data";
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
            <div className="printableArea" ref={printRef} style={{ flex: 1, width: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <TestBaseInfoTable />
                <div style={{ flex: 1, width: '100%', display: 'flex' }}>
                    <MyLineChart width="100%" height="100%" />
                </div>
                <ResultInfoTable />
            </div>
            <div style={{ textAlign: 'right', width: '100%', maxWidth: '1200px', padding: '16px', height: '80px' }}>
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
                <Button

                    type="primary"
                    icon={<PauseCircleOutlined />}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        //偏紫色
                        backgroundColor: '#722ed1',
                        border: 'none',
                        borderRadius: '4px',
                        marginLeft: '16px'
                    }}
                    onClick={EndTest}
                >
                    {t('endTest')}
                </Button>
                <Button type="primary"
                    icon={<ExportOutlined />}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        //其他颜色 偏黄一点 不要跟上面的一样
                        backgroundColor: '#faad24',
                        border: 'none',
                        borderRadius: '4px',
                        marginLeft: '16px'
                    }}
                    onClick={exportData}
                >
                    {t('exportData')}
                </Button>
            </div>
        </div>
    );
};

export default TestingContent;