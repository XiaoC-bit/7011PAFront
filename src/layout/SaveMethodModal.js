import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { formState, isFirstCreateMethodState, hasChangeMethodState } from '../data/Data';
import { useAtom } from 'jotai';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const SaveMethodModal = ({ visible, onSave, onCancel, isSaveAs }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(formState);
    const [open, setOpen] = useState(false);

    const [isFirstCreateMethod, setIsFirstCreateMethod] = useAtom(isFirstCreateMethodState);
    useEffect(() => {
        if (visible) {
            checkFormData();
        }
    }, [visible]);

    const handleSave = () => {

        const { configForm, testModeConfig } = formData;
        const data = {
            "__channel": "config-method-message",
            "__type": "modifyData",
            configForm,
            testModeConfig,
        };


        wsService.sendMessage(data);

        const token = PubSub.subscribe('config-method-message-modifyData', (_, data) => {
            PubSub.unsubscribe(token);
            if (data.status === 'success') {
                message.success(t('saveSuccess'));
                form.resetFields();
                setOpen(false);
                setIsFirstCreateMethod(false);
                setFormData((prevState) => ({
                    ...prevState,
                    dirty: false
                }));

            }
            else {
                message.error(t(data.message));
            }
        });



    };


    const handleSaveAs = () => {
        const formValues = form.getFieldsValue();
        const { methodName, methodRemark } = formValues;

        if (!methodName) {
            message.warning(t('pleaseCompleteFormItems'));
            return;
        }

        const { configForm, testModeConfig } = formData;
        const data = {
            "__channel": "config-method-message",
            "__type": "addData",
            configForm,
            testModeConfig,
            methodName,
            methodRemark
        };


        wsService.sendMessage(data);

        const token = PubSub.subscribe('config-method-message-addData', (_, data) => {
            PubSub.unsubscribe(token);
            if (data.status === 'success') {
                message.success(t('saveSuccess'));
                form.resetFields();
                setOpen(false);
            }
            else {
                message.error(t(data.message));
            }
        });

    };

    const checkFormData = () => {
        const { configForm, testModeConfig } = formData;
        const isComplete = configForm && Object.keys(configForm).length > 0 && testModeConfig && Object.keys(testModeConfig).length > 0;

        if (!isComplete) {
            message.warning(t('pleaseCompleteForm'));
            onCancel();
        }
        else {
            setOpen(true);
        }
    };

    return (
        isSaveAs ?
            <Modal
                title={t('saveMethod')}
                open={open}
                onOk={() => {
                    handleSaveAs();
                    onCancel();
                }}
                onCancel={() => {
                    onCancel();
                    setOpen(false);
                    form.resetFields();
                }}
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
            </Modal> :
            <Modal
                title={t('are you sure to save the change?')}
                open={visible}
                onOk={() => {
                    handleSave();
                    onCancel();
                    setOpen(false);
                }}
                onCancel={() => {
                    onCancel();
                    setOpen(false);
                }}
                okText={t('confirm')}
                cancelText={t('cancel')}
            >
            </Modal>

    );
};

export default SaveMethodModal;