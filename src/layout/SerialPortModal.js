import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Button, Space, message, Descriptions, Badge } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const { Option } = Select;

const SerialPortModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [ports, setPorts] = useState([]);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchPorts = () => {
        setLoading(true);
        const __channel = 'config-method-message';
        const __type = 'fetchSerialPorts';
        const data = {
            __channel,
            __type
        };

        wsService.sendMessage(data);

        const token = PubSub.subscribe(__channel + '-' + __type, (_, msg) => {
            PubSub.unsubscribe(token);
            setLoading(false);
            if (msg.status === 'success' && msg.data) {
                setPorts(msg.data);
                if (msg.data.length > 0) {
                    form.setFieldsValue({ port: msg.data[0] });
                }
            } else {
                setPorts([]);
                message.error(t('serialPort.noPorts'));
            }
        });
    };

    const handleConnect = () => {
        const port = form.getFieldValue('port');
        if (!port) {
            message.warning(t('serialPort.selectFirst'));
            return;
        }

        const __channel = 'serial-port-message';
        const __type = 'connect-port';
        const data = {
            __channel,
            __type,
            port
        };

        wsService.sendMessage(data);

        const token = PubSub.subscribe(__channel + '-' + __type, (_, msg) => {
            PubSub.unsubscribe(token);
            if (msg.status === 'success') {
                setConnected(true);
                message.success(t('serialPort.connectSuccess'));
            } else {
                setConnected(false);
                message.error(msg.message || t('serialPort.connectFailed'));
            }
        });
    };

    const handleDisconnect = () => {
        const __channel = 'serial-port-message';
        const __type = 'disconnect-port';
        const data = {
            __channel,
            __type
        };

        wsService.sendMessage(data);

        const token = PubSub.subscribe(__channel + '-' + __type, (_, msg) => {
            PubSub.unsubscribe(token);
            if (msg.status === 'success') {
                setConnected(false);
                message.success(t('serialPort.disconnectSuccess'));
            } else {
                message.error(t('serialPort.disconnectFailed'));
            }
        });
    };

    const handleOk = () => {
        form.validateFields().then(() => {
            onOk?.();
        });
    };

    useEffect(() => {
        if (visible) {
            form.resetFields();
            setPorts([]);
            setConnected(false);
            fetchPorts();
        }
    }, [visible]);

    return (
        <Modal
            title={t('serialPort.title')}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText={t('serialPort.okText')}
            cancelText={t('serialPort.cancelText')}
            destroyOnClose
            width={480}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 16 }}
            >
                <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
                    <Descriptions.Item label={t('serialPort.status')}>
                        {connected ? (
                            <Badge status="success" text={t('serialPort.connected')} />
                        ) : (
                            <Badge status="default" text={t('serialPort.disconnected')} />
                        )}
                    </Descriptions.Item>
                </Descriptions>

                <Form.Item
                    name="port"
                    label={t('serialPort.portLabel')}
                    rules={[{ required: true, message: t('serialPort.portRequired') }]}
                >
                    <Select
                        placeholder={t('serialPort.portPlaceholder')}
                        loading={loading}
                        showSearch
                        optionFilterProp="children"
                    >
                        {ports.map((portName) => (
                            <Option key={portName} value={portName}>
                                {portName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchPorts}
                            loading={loading}
                        >
                            {t('serialPort.refresh')}
                        </Button>
                        {!connected ? (
                            <Button type="primary" onClick={handleConnect}>
                                {t('serialPort.connect')}
                            </Button>
                        ) : (
                            <Button danger onClick={handleDisconnect}>
                                {t('serialPort.disconnect')}
                            </Button>
                        )}
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SerialPortModal;