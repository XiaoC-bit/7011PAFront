import React, { useState } from 'react';
import { Modal, Table, Button, Row, Col, InputNumber, Form } from 'antd';
import { useTranslation } from 'react-i18next';

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const [form] = Form.useForm();

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form form={form} style={{ margin: 0 }}>
                <Form.Item
                    style={{ margin: 0 }}
                    name={dataIndex}
                    rules={[
                        {
                            required: true,
                            message: `${title} is required.`,
                        },
                    ]}
                >
                    <InputNumber onPressEnter={save} onBlur={save} />
                </Form.Item>
            </Form>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{ paddingRight: 24 }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

const AdjustModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    const [data, setData] = useState(Array.from({ length: 10 }, (_, index) => ({
        key: index + 1,
        number: index + 1,
        nValue: 0,
        calAd: 0,
        absAd: 0
    })));
    const [motorSpeed, setMotorSpeed] = useState(500);

    const handleSave = (row) => {
        const newData = [...data];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
    };

    const columns = [
        {
            title: t('adjustModal.number'),
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: 'N',
            dataIndex: 'nValue',
            key: 'nValue',
            editable: true,
        },
        {
            title: 'Cal_AD',
            dataIndex: 'calAd',
            key: 'calAd',
        },
        {
            title: 'Abs_AD',
            dataIndex: 'absAd',
            key: 'absAd',
        }
    ];

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

    return (
        <Modal
            visible={visible}
            title={t('adjustModal.title')}
            okText={t('adjustModal.okText')}
            cancelText={t('adjustModal.cancelText')}
            onCancel={onCancel}
            onOk={onOk}
            width={800}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Table
                        dataSource={data}
                        columns={mergedColumns}
                        pagination={false}
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                    />
                </Col>
                <Col span={12}>
                    <Button type="primary" style={{ marginBottom: 16 }}>{t('adjustModal.reset')}</Button>
                    <div style={{ marginBottom: 16 }}>
                        {t('adjustModal.currentMotorSpeed')}: {motorSpeed} mm/min
                    </div>
                    <Button type="primary" style={{ marginBottom: 16, marginLeft: 16 }}>{t('adjustModal.increase')}</Button>
                    <Button type="primary" style={{ marginBottom: 16, marginLeft: 16 }}>{t('adjustModal.stop')}</Button>
                    <Button type="primary" style={{ marginBottom: 16, marginLeft: 16 }}>{t('adjustModal.decrease')}</Button>
                </Col>
            </Row>
        </Modal>
    );
};

export default AdjustModal;