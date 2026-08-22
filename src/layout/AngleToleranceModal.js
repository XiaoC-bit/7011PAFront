import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';
import { formState } from '../data/Data';
import { useAtom } from 'jotai';

const AngleToleranceModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [, setFormData] = useAtom(formState);

    const fetchAngleTolerance = () => {
        setLoading(true);
        const __channel = 'config-method-message';
        const __type = 'fetchAngleTolerance';
        const data = {
            __channel,
            __type
        };

        wsService.sendMessage(data);

        const token = PubSub.subscribe(__channel + '-' + __type, (_, msg) => {
            PubSub.unsubscribe(token);
            setLoading(false);
            if (msg.status === 'success' && msg.data !== undefined && msg.data !== null) {
                form.setFieldsValue({ angleTolerance: msg.data });
            } else {
                form.setFieldsValue({ angleTolerance: undefined });
                message.error(msg.message || t('angleTolerance.fetchFailed'));
            }
        });
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            const __channel = 'config-method-message';
            const __type = 'updateAngleTolerance';
            const data = {
                __channel,
                __type,
                angleTolerance: values.angleTolerance
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + '-' + __type, (_, msg) => {
                PubSub.unsubscribe(token);
                if (msg.status === 'success') {
                    message.success(t('angleTolerance.updateSuccess'));
                    setFormData((prevState) => ({
                        ...prevState,
                        configForm: {
                            ...prevState.configForm,
                            angleTolerance: values.angleTolerance
                        }
                    }));
                    onOk?.();
                } else {
                    message.error(t(msg.message));
                }
            });
        });
    };

    useEffect(() => {
        if (visible) {
            form.resetFields();
            fetchAngleTolerance();
        }
    }, [visible]);

    return (
        <Modal
            title={t('angleTolerance.title')}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText={t('angleTolerance.okText')}
            cancelText={t('angleTolerance.cancelText')}
            destroyOnClose
            width={480}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 16 }}
            >
                <Form.Item
                    name="angleTolerance"
                    label={t('angleTolerance.label')}
                    rules={[{ required: true, message: t('angleTolerance.required') }]}
                >
                    <InputNumber
                        placeholder={t('angleTolerance.placeholder')}
                        loading={loading}
                        style={{ width: '100%' }}
                        step={0.1}
                        precision={3}
                        min={0}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AngleToleranceModal;
