import React, { useEffect, useState } from 'react';
import { Col, Modal, Row, Table, Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import HistoryChart from './ReportChartHistory';
import TestBaseInfoTableHistory from './TestBaseInfoTableHistory';
import ResultInfoHistoryTable from './ResultInfoTableHistory';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';
import { type } from '@testing-library/user-event/dist/type';

const ReportHistoryModal = ({ visible, onOk, onCancel, width, height }) => {
    const { t } = useTranslation();

    const [data, setData] = useState([]);
    const [options, setOptions] = useState([
    ]);
    const [method, setMethod] = useState('');

    const fetchMethod = async (page = 1, pageSize = 1000) => {
        try {
            const __channel = "config-method-message";
            const __type = "fetchData";
            const data = {
                "__channel": __channel,
                "__type": __type,
                page,
                pageSize,
            };

            wsService.sendMessage(data);

            const response = await new Promise((resolve, reject) => {
                const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                    PubSub.unsubscribe(token);
                    if (data.status === 'success') {
                        resolve(data);
                    } else {
                        reject(new Error(t('fetchFailed')));
                    }
                });
            });
            setOptions(response.methods.map((item) => {
                return {
                    label: item.name,
                    value: item.name
                };
            }));

        } catch (error) {
        } finally {
        }
    };

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });
    const [columns, setColumns] = useState([
        {
            title: t('key'),
            dataIndex: 'key',
            key: 'key',
            width: 50
        },
        {
            title: t('specimen_name'),
            dataIndex: 'specimen_name',
            key: 'specimen_name',
            width: 120
        },
        {
            title: t('specimen_number'),
            dataIndex: 'specimen_number',
            key: 'specimen_number',
            width: 120
        },
        {
            title: t('production_date'),
            dataIndex: 'production_date',
            key: 'production_date',
            width: 120
        },
        {
            title: t('batch_number'),
            dataIndex: 'batch_number',
            key: 'batch_number',
            width: 120
        },
        {
            title: t('operator'),
            dataIndex: 'operator',
            key: 'operator',
            width: 120
        },
        {
            title: t('lab_temperature'),
            dataIndex: 'lab_temperature',
            key: 'lab_temperature',
            width: 120
        },
        {
            title: t('lab_humidity'),
            dataIndex: 'lab_humidity',
            key: 'lab_humidity',
            width: 120
        },
        {
            title: t('remarks'),
            dataIndex: 'remarks',
            key: 'remarks',
            width: 120
        },
    ]);

    // 请求数据
    const fetchData = async (page, pageSize) => {

        const __channel = "report-message";
        const __type = "fetch-history-data";
        const payload = {
            __channel,
            __type,
            page,
            pageSize,
            method
        };

        try {
            wsService.sendMessage(payload);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, response) => {
                PubSub.unsubscribe(token);

                // 更新 columns
                setData(response.data || []);

                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize,
                    total: response.total,
                }));
            });
        } catch (err) {
        }
    };
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        fetchMethod();
    }, []);


    const rowSelection = {
        type: 'radio',
        selectedRowKeys,
        onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys);
        },
    };

    const [historyBaseInfo, setHistoryBaseInfo] = useState([]);

    const [refreshKey, setRefreshKey] = useState(0); // 用于刷新组件
    const onOpen = () => {
        data.forEach((item) => {
            if (selectedRowKeys.includes(item.key)) {
                setHistoryBaseInfo(item);
                setRefreshKey(prev => prev + 1); // 修改 key，强制刷新组件
            }
        });
        //setHistoryBaseInfo(data[selectedRowKeys[0]]);
    };

    useEffect(() => {
        onOpen();
    }, [selectedRowKeys]);

    const onClose = () => {
        setSelectedRowKeys([]);
        setHistoryBaseInfo([]);
        setMethod('');
        setData([]);
        setRefreshKey(0); // 重置 key
    };

    return (
        <Modal
            title={t('reportHistory')}
            open={visible}
            onOk={() => {
                onOk();
                onClose();
            }}
            onCancel={() => {
                onCancel();
                onClose();
            }}
            footer={null}
            width={width}
            maskClosable={false}
            bodyProps={{ style: { height: height, } }}
            centered
        >

            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', }}>
                {/* 第一行：固定高度 */}
                <div style={{ height: 50, }}>
                    <span style={{ marginRight: '16px' }}>{t('method')}</span>
                    <Select style={{ width: 200 }} placeholder="选择项"
                        options={options}
                        value={method}
                        onChange={(value) => {
                            const __channel = "report-message";
                            const __type = "fetch-history-data";
                            const data = {
                                "__channel": __channel,
                                "__type": __type,
                                method: value,
                                page: 1,
                                pageSize: pagination.pageSize,
                            };

                            wsService.sendMessage(data);
                            fetchData(1, pagination.pageSize);
                            setMethod(value);
                        }}
                    >

                    </Select>
                    {/* <Button type="primary" style={{ marginLeft: '16px' }}
                        disabled={selectedRowKeys.length !== 1}
                        onClick={onOpen}
                    >{t('open')}</Button> */}
                    <Button type="primary" style={{ marginLeft: '16px' }}
                        disabled={selectedRowKeys.length !== 1}
                        onClick={() => {
                            const __channel = "report-message";
                            const __type = "export-history-data";
                            const data = {
                                "__channel": __channel,
                                "__type": __type,
                                method: method,
                                queue_id: selectedRowKeys[0],
                            };

                            wsService.sendMessage(data);
                        }}
                    >{t('export data')}</Button>
                </div>

                {/* 第二行：动态高度 */}
                <div style={{
                    flex: 1, overflow: 'auto', minHeight: 0,

                    display: 'flex',

                }}>
                    <div style={{
                        display: 'flex', flexDirection: 'column', width: "600px",

                        boxSizing: "border-box",
                        paddingRight: "16px"

                    }}>
                        <Table
                            columns={columns}
                            dataSource={data}
                            pagination={pagination}
                            onChange={(pagination) => {
                                fetchData(pagination.current, pagination.pageSize);
                            }}
                            rowSelection={rowSelection}
                            onRow={(record) => ({
                                onClick: () => {
                                    const { key } = record;
                                    setSelectedRowKeys([key]); // 只允许单选
                                },
                            })}
                            scroll={{ x: "max-content", y: '600px' }} // 💡 关键点
                        />
                    </div>
                    <div
                        style={{
                            flex: 1, overflow: "hidden",
                            display: 'flex', flexDirection: 'column',
                        }}
                    >

                        <div style={{ height: 'auto', boxSizing: 'border-box', paddingBottom: '16px' }}>
                            <TestBaseInfoTableHistory baseInfo={historyBaseInfo} />
                        </div>

                        <div style={{
                            flex: 1, display: 'flex', minHeight: 0,
                            backgroundColor: "lightyellow"
                        }}>
                            <HistoryChart width={"100%"} height={"100%"}
                                key={refreshKey}
                                method={method}
                                req_queue_id={selectedRowKeys[0]}
                            />
                        </div>

                        <div style={{ height: "200px", minHeight: 0, backgroundColor: "" }}>
                            <ResultInfoHistoryTable
                                key={refreshKey}
                                method={method}
                                req_queue_id={selectedRowKeys[0]}
                            />
                        </div>

                    </div>
                </div>

            </div>



        </Modal >
    );
};

export default ReportHistoryModal;