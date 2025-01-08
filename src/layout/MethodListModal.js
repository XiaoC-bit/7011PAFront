import React, { useState, useEffect } from 'react';
import { Modal, Button, Table } from 'antd';
import { useTranslation } from 'react-i18next';

import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const MethodListModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const data = [
        { key: '1', name: t('method1'), remarks: t('remark1') },
        { key: '2', name: t('method2'), remarks: t('remark2') },
        { key: '3', name: t('method3'), remarks: t('remark3') },
    ];

    const columns = [
        {
            title: t('methodName'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: t('remarks'),
            dataIndex: 'remarks',
            key: 'remarks',
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys) => {
            setSelectedRowKeys(selectedRowKeys);
        },
    };

    const handleDelete = () => {
        // 删除逻辑
    };

    const handleOpen = () => {
        // 打开逻辑
    };

    useEffect(() => {
        const handleMessage = (msg, data) => {
            console.log('Received message:', data);
        };

        const token = PubSub.subscribe('normal-message-real-data', handleMessage);

        return () => {
            PubSub.unsubscribe(token);
        };
    }, []);

    return (
        <Modal
            title={t('methods')}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            footer={[
                <Button key="delete" onClick={handleDelete} disabled={selectedRowKeys.length === 0}>
                    {t('delete')}
                </Button>,
                <Button key="open" type="primary" onClick={handleOpen} disabled={selectedRowKeys.length !== 1}>
                    {t('open')}
                </Button>,
                <Button key="cancel" onClick={onCancel}>
                    {t('cancel')}
                </Button>,
            ]}
        >
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={data}
            />
        </Modal>
    );
};

export default MethodListModal;