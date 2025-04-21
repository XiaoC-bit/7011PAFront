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

            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 190px)', alignItems: 'center', boxSizing: 'border-box', width: '100%', minWidth: 0 }}>
            <div className="printableArea" ref={printRef} style={{
                flex: 1, width: '100%', padding: '0px', display: 'flex', flexDirection: 'column',
                boxSizing: "border-box"
                ,
            }}>
                <div style={{ minHeight: "auto", backgroundColor: "green", boxSizing: 'border-box', marginBottom: '8px' }}>
                    <TestBaseInfoTable />
                </div>
                <div style={{
                    flex: 2, display: 'flex', minHeight: 0, backgroundColor: "lightyellow",
                    minWidth: 0, width: '100%'
                }}>
                    <div style={{ flex: 1, height: '100%', minWidth: 0, width: '100%' }}>
                        <MyLineChart width={"100%"} height={"100%"} />
                    </div>
                </div>
                <div style={{ flex: 1, minHeight: 0, backgroundColor: '', boxSizing: 'border-box', marginTop: '8px' }}>
                    <ResultInfoTable />
                </div>
            </div>
            <div style={{
                textAlign: 'right', width: '100%', height: '50px',
            }}>
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