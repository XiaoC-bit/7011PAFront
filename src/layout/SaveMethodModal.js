import React from 'react';
import { Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

const SaveMethodModal = ({ visible, onSave, onCancel }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                onSave(values);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={t('saveMethod')}
            visible={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText={t('save')}
            cancelText={t('cancel')}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="methodName"
                    label={t('methodName')}
                    rules={[{ required: true, message: t('pleaseInputMethodName') }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="methodRemark"
                    label={t('remark')}
                >
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SaveMethodModal;