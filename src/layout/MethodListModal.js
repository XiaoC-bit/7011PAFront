import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, message } from 'antd';
import { useTranslation } from 'react-i18next';

import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';
import { formState, isFirstCreateMethodState } from '../data/Data';
import { useAtom } from 'jotai';

const MethodListModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [isFirstCreateMethod, setIsFirstCreateMethod] = useAtom(isFirstCreateMethodState);

    const [formData, setFormData] = useAtom(formState);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const onClose = () => {
        setSelectedRowKeys([]);
        onCancel();
    };

    useEffect(() => {
        if (visible) {
            fetchData(pagination.current, pagination.pageSize);
        }

    }, [visible]);

    const columns = [
        {
            title: t('methodName'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: t('remark'),
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: t('default'),
            dataIndex: 'is_current',
            key: 'is_current',
            render: (text, record) => {
                return text ? t('✓') : t('');
            }
        }
    ];

    const rowSelection = {
        //允许行选择

        selectedRowKeys,
        onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys);
        },
    };

    const handleDelete = async () => {
        // 删除逻辑
        try {
            //找到选中的行
            let is_current = false;
            data.forEach((item) => {
                if (selectedRowKeys.includes(item.key)) {
                    is_current = item.is_current;
                }
            });
            if (is_current) {
                message.error(t('cannotDeleteDefaultMethod'));
                return;
            }


            if (selectedRowKeys.length === 0) {
                return;
            }

            const __channel = "config-method-message";
            const __type = "deleteData";
            const sendMessage = {
                "__channel": __channel,
                "__type": __type,
                ids: selectedRowKeys,
            };

            wsService.sendMessage(sendMessage);


            const response = await new Promise((resolve, reject) => {
                const token = PubSub.subscribe(__channel + "-" + __type, (_, recvData) => {
                    PubSub.unsubscribe(token);
                    if (recvData.status === 'success') {
                        resolve(recvData);
                    } else {
                        reject(new Error(t(recvData.message) || t('deleteFailed')));
                    }
                });
            });

            message.success(t('deleteSuccess'));
            setSelectedRowKeys([]);
            fetchData(pagination.current, pagination.pageSize); // 刷新数据


        } catch (error) {
            message.error(error.message || t('deleteFailed'));
        } finally {
            setLoading(false);
        }
    };


    const snakeToCamel = (str) => {
        return str.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
    };

    const transformDataKeys = (data) => {
        const newItem = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                newItem[snakeToCamel(key)] = data[key];
            }
        }
        return newItem;
    };

    const handleOpen = async () => {
        // 打开逻辑
        //
        try {
            if (selectedRowKeys.length !== 1) {
                return;
            }

            const __channel = "config-method-message";
            const __type = "fetchDetail";
            const data = {
                "__channel": __channel,
                "__type": __type,
                key: selectedRowKeys.at(0)
            };

            wsService.sendMessage(data);


            const response = await new Promise((resolve, reject) => {
                const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                    PubSub.unsubscribe(token);
                    if (data.status === 'success') {
                        resolve(data);
                    } else {
                        reject(new Error(t('deleteFailed')));
                    }
                });
            });


            const transformedData = transformDataKeys(response.data[0]);

            setFormData((prevState) => ({
                ...prevState,
                configForm: transformedData,
                testModeConfig: transformedData,
                testModeConfigInitial: transformedData,
                configFormInitial: transformedData,
                dirty: false,
            }));
            setIsFirstCreateMethod(false);

            onClose();

        } catch (error) {
            message.error(error.message || t('deleteFailed'));
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async (page, pageSize) => {
        setLoading(true);
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

            setData(response.methods);
            setPagination({
                ...pagination,
                current: page,
                pageSize,
                total: response.total,
            });
        } catch (error) {
            message.error(error.message || t('fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        fetchData(pagination.current, pagination.pageSize);
    };



    return (
        <Modal
            title={t('methods')}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            footer={[
                <Button key="delete" onClick={handleDelete} disabled={selectedRowKeys.length === 0 || data.length === 1}>
                    {t('delete')}
                </Button>,
                <Button key="open" type="primary" onClick={handleOpen} disabled={selectedRowKeys.length !== 1}>
                    {t('set as default')}
                </Button>,
                <Button key="cancel" onClick={onClose}>
                    {t('cancel')}
                </Button>,
            ]}
        >
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                onRow={(record) => ({
                    onClick: () => {
                        const key = record.key;
                        const selected = selectedRowKeys.includes(key);
                        const newKeys = selected
                            ? selectedRowKeys.filter(k => k !== key)
                            : [...selectedRowKeys, key];
                        setSelectedRowKeys(newKeys);
                    }
                })}
            />
        </Modal>
    );
};

export default MethodListModal;