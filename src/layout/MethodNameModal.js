import React from "react";
import { Modal, Input, Form, message } from "antd";
import { useTranslation } from "react-i18next";
import PubSub from 'pubsub-js';
import { formState, isFirstCreateMethodState } from '../data/Data';
import { useAtom } from 'jotai';
import wsService from '../services/WebSocketService';

const MethodNameModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [formData, setFormData] = useAtom(formState);
    const [isFirstCreateMethod, setIsFirstCreateMethod] = useAtom(isFirstCreateMethodState);


    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            form.resetFields();

            const { configForm, testModeConfig } = formData;
            //遍历，把configForm和testModeConfig中字段都设置为空
            for (let key in configForm) {
                configForm[key] = "";
            }
            for (let key in testModeConfig) {
                testModeConfig[key] = "";
            }
            testModeConfig['mode'] = "static";
            configForm['zeroMode'] = ["torqueZero"];
            configForm['unit'] = "N";

            testModeConfig['specimenNumber'] = "";
            const data = {
                "__channel": "config-method-message",
                "__type": "addData",
                configForm,
                testModeConfig,
                methodName: values.methodName,
                methodRemark: ""
            };


            wsService.sendMessage(data);

            const token = PubSub.subscribe('config-method-message-addData', (_, data) => {
                PubSub.unsubscribe(token);
                onOk(); // 把方法名传给父组件
                setIsFirstCreateMethod(true);
                setFormData((prevState) => ({
                    ...prevState,
                    testModeConfig,
                    configForm,
                    dirty: false
                }));

                if (data.status === 'success') {
                    message.success(t('saveSuccess'));
                    form.resetFields();
                }
                else {
                    message.error(t(data.message));
                }
            });

        } catch (errorInfo) {
            // 校验失败，什么都不做
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={t("methodModal.title")}
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="methodName"
                    label={t("methodModal.label")}
                    rules={[{ required: true, message: t("methodModal.validation") }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MethodNameModal;
