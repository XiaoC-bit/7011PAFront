// components/AdvancedSettingsModal.jsx
import React, { useEffect } from "react";
import { Modal, Form, Select, message } from "antd";
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const { Option } = Select;

const AdvancedSettingsModal = ({ visible, onClose, onSave }) => {
    const [form] = Form.useForm();
    const [initialValues, setInitialValues] = React.useState({
        samplingRate: 0
    });
    const handleOk = () => {
        form.validateFields()
            .then(values => {

                try {
                    const __channel = "control-message";
                    const __type = "set-sampling-rate";
                    const data = {
                        "__channel": __channel,
                        "__type": __type,
                        "samplingRate": values.samplingRate
                    };

                    wsService.sendMessage(data);


                } catch (error) {
                    message.error(error.message);
                } finally {
                }

            });
    };

    useEffect(() => {
        const token = PubSub.subscribe("normal-message-real-data", (_, data) => {

            if (data.connectErr === false) {

                setInitialValues({
                    samplingRate: data.SAMPLE_RATE
                });

            }
        });

    }, []);

    return (
        <Modal
            title="高级设置"
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            okText="保存"
            cancelText="取消"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
            >
                <Form.Item
                    name="samplingRate"
                    label="采样率"
                    rules={[{ required: true, message: "请选择采样率" }]}
                >
                    <Select placeholder="请选择采样率">
                        <Option value={0}>10K</Option>
                        <Option value={1}>5K</Option>
                        <Option value={3}>2.5K</Option>
                        <Option value={4}>4K</Option>
                        <Option value={9}>1K</Option>
                        <Option value={19}>500</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdvancedSettingsModal;
