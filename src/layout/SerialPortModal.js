import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Button, Space, message, Descriptions, Badge } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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

        const baudRate = form.getFieldValue('baudRate') || 115200;
        const dataBits = form.getFieldValue('dataBits') || 8;
        const stopBits = form.getFieldValue('stopBits') || 1;
        const parity = form.getFieldValue('parity') || 'none';

        const __channel = 'serial-port-message';
        const __type = 'connect-port';
        const data = {
            __channel,
            __type,
            port,
            baudRate,
            dataBits,
            stopBits,
            parity
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
                initialValues={{
                    baudRate: 115200,
                    dataBits: 8,
                    stopBits: 1,
                    parity: 'none'
                }}
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

                <Form.Item
                    name="baudRate"
                    label={t('serialPort.baudRateLabel')}
                    rules={[{ required: true, message: t('serialPort.baudRateRequired') }]}
                >
                    <Select placeholder={t('serialPort.baudRatePlaceholder')}>
                        <Option value={9600}>9600</Option>
                        <Option value={19200}>19200</Option>
                        <Option value={38400}>38400</Option>
                        <Option value={57600}>57600</Option>
                        <Option value={115200}>115200</Option>
                        <Option value={230400}>230400</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="dataBits"
                    label={t('serialPort.dataBitsLabel')}
                    rules={[{ required: true, message: t('serialPort.dataBitsRequired') }]}
                >
                    <Select>
                        <Option value={5}>5</Option>
                        <Option value={6}>6</Option>
                        <Option value={7}>7</Option>
                        <Option value={8}>8</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="stopBits"
                    label={t('serialPort.stopBitsLabel')}
                    rules={[{ required: true, message: t('serialPort.stopBitsRequired') }]}
                >
                    <Select>
                        <Option value={1}>1</Option>
                        <Option value={1.5}>1.5</Option>
                        <Option value={2}>2</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="parity"
                    label={t('serialPort.parityLabel')}
                    rules={[{ required: true, message: t('serialPort.parityRequired') }]}
                >
                    <Select>
                        <Option value="none">{t('serialPort.parityNone')}</Option>
                        <Option value="odd">{t('serialPort.parityOdd')}</Option>
                        <Option value="even">{t('serialPort.parityEven')}</Option>
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