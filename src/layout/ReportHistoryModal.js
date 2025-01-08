import React, { useState } from 'react';
import { Modal, Table } from 'antd';
import { useTranslation } from 'react-i18next';

const ReportHistoryModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();

    const data = [
        { key: '1', specimenName: 'Specimen 1', specimenNumber: '001', batchNumber: 'Batch 1', productionDate: '2023-01-01', operator: 'Operator 1', labTemperature: '25°C', labHumidity: '60%', remarks: 'Remark 1' },
        { key: '2', specimenName: 'Specimen 2', specimenNumber: '002', batchNumber: 'Batch 2', productionDate: '2023-01-02', operator: 'Operator 2', labTemperature: '26°C', labHumidity: '65%', remarks: 'Remark 2' },
        { key: '3', specimenName: 'Specimen 3', specimenNumber: '003', batchNumber: 'Batch 3', productionDate: '2023-01-03', operator: 'Operator 3', labTemperature: '27°C', labHumidity: '70%', remarks: 'Remark 3' },
    ];

    const columns = [
        {
            title: t('specimenName'),
            dataIndex: 'specimenName',
            key: 'specimenName',
        },
        {
            title: t('specimenNumber'),
            dataIndex: 'specimenNumber',
            key: 'specimenNumber',
        },
        {
            title: t('batchNumber'),
            dataIndex: 'batchNumber',
            key: 'batchNumber',
        },
        {
            title: t('productionDate'),
            dataIndex: 'productionDate',
            key: 'productionDate',
        },
        {
            title: t('operator'),
            dataIndex: 'operator',
            key: 'operator',
        },
        {
            title: t('labTemperature'),
            dataIndex: 'labTemperature',
            key: 'labTemperature',
        },
        {
            title: t('labHumidity'),
            dataIndex: 'labHumidity',
            key: 'labHumidity',
        },
        {
            title: t('remarks'),
            dataIndex: 'remarks',
            key: 'remarks',
        },
    ];

    return (
        <Modal
            title={t('reportHistory')}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            footer={null}
            width={1000}
        >
            <Table
                columns={columns}
                dataSource={data}
            />
        </Modal>
    );
};

export default ReportHistoryModal;