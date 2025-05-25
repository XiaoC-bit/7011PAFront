import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Select, Row, Col, InputNumber, Form, Checkbox, message } from 'antd';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

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
    const [X_DIR, setX_DIR] = useState(false);
    const [Y_DIR, setY_DIR] = useState(false);

    const [xAdChannel, setXAdChannel] = useState('AD1');
    const [yzAdChannel, setYzAdChannel] = useState('AD1');

    const [xGain, setXGain] = useState(1.0);
    const [yzGain, setYzGain] = useState(1.0);
    const [AD_1_Gain, setAD_1_Gain] = useState(1.0);
    const [AD_2_Gain, setAD_2_Gain] = useState(1.0);


    const [AD_1_CAP, setAD_1_CAP] = useState(1.0);
    const [AD_2_CAP, setAD_2_CAP] = useState(1.0);

    const [AD1_DIR, setAD1_DIR] = useState(false);
    const [AD2_DIR, setAD2_DIR] = useState(false);
    const [AD1_UPDN, setAD1_UPDN] = useState(false);
    const [AD2_UPDN, setAD2_UPDN] = useState(false);

    const [AD1_Gain] = useState(1.0);

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



    useEffect(() => {
        const token = PubSub.subscribe("normal-message-real-data", (_, data) => {

            //PubSub.unsubscribe(token);
            if (data.connectErr === false) {
                PubSub.unsubscribe(token);
                //取出 data.Sys_Flag1  BIT 9 和 BIT 10
                let bit9 = (data.Sys_Flag1 >> 9) & 1;
                let bit10 = (data.Sys_Flag1 >> 10) & 1;
                setX_DIR(bit9 === 1 ? true : false);
                setY_DIR(bit10 === 1 ? true : false);

                //保留三位小数
                setXGain(data.X_RATE.toFixed(9));
                setYzGain(data.YZ_RATE.toFixed(9));

                setAD_1_Gain(data.AD_1_GAIN.toFixed(9));
                setAD_2_Gain(data.AD_2_GAIN.toFixed(9));

                setAD_1_CAP(data.AD_1_CAP.toFixed(9));
                setAD_2_CAP(data.AD_2_CAP.toFixed(9));

                if (1) {
                    let bit0 = (data.DIR_FLAG >> 0) & 1;
                    let bit1 = (data.DIR_FLAG >> 1) & 1;
                    let bit8 = (data.DIR_FLAG >> 8) & 1;
                    let bit9 = (data.DIR_FLAG >> 9) & 1;
                    setAD1_DIR(bit0 === 1 ? true : false);
                    setAD2_DIR(bit1 === 1 ? true : false);
                    setAD1_UPDN(bit8 === 1 ? true : false);
                    setAD2_UPDN(bit9 === 1 ? true : false);
                }

            }
            else {
                //通讯失败
            }
        });
        return () => {
            PubSub.unsubscribe(token);
        };
    }, []);


    const updateXDIR = (value) => {
        try {
            const __channel = "control-message";
            const __type = "setXDIR";
            const data = {
                "__channel": __channel,
                "__type": __type,
                "on": value
            };

            wsService.sendMessage(data);
            //打印



            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);

            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };


    const updateYZDIR = (value) => {
        try {
            const __channel = "control-message";
            const __type = "setYZDIR";
            const data = {
                "__channel": __channel,
                "__type": __type,
                "on": value
            };

            wsService.sendMessage(data);
            //打印



            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);

            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };



    return (
        <Modal
            visible={visible}
            title={t('adjustModal.title')}
            okText={t('adjustModal.okText')}
            cancelText={t('adjustModal.cancelText')}
            onCancel={onCancel}
            onOk={onOk}
            width={1000}
        >
            <Row gutter={16}>
                {/* <Col span={12}>
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
                    <Button type="primary" style={{ marginBottom: 16 }}>{t('adjustModal.reset')}</Button>
                    <div style={{ marginBottom: 16 }}>
                        {t('adjustModal.currentMotorSpeed')}: {motorSpeed} mm/min
                    </div>
                    <Button type="primary" style={{ marginBottom: 16, marginLeft: 16 }}>{t('adjustModal.increase')}</Button>
                    <Button type="primary" style={{ marginBottom: 16, marginLeft: 16 }}>{t('adjustModal.stop')}</Button>
                    <Button type="primary" style={{ marginBottom: 16, marginLeft: 16 }}>{t('adjustModal.decrease')}</Button>

                </Col> */}
                <Col span={12}>
                    {/* X方向配置 */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ marginBottom: 16 }}>{t('adjustModal.xDirectionConfig')}</h4>

                        {/* 第一行：AD选择 + Gain + 写入按钮 */}
                        <Row gutter={[16, 16]} align="middle">
                            <Col span={16}>
                                <Form.Item label={t('adjustModal.xGain')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <InputNumber
                                        value={xGain}
                                        onChange={setXGain}
                                        step={0.000000001}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" onClick={() => {
                                    try {
                                        const __channel = "control-message";
                                        const __type = "setXGAIN";
                                        const data = {
                                            "__channel": __channel,
                                            "__type": __type,
                                            "GAIN": xGain
                                        };

                                        wsService.sendMessage(data);


                                    } catch (error) {
                                        message.error(error.message);
                                    } finally {
                                    }
                                }}>
                                    {t('submit')}
                                </Button>
                            </Col>
                        </Row>

                        {/* 第二行：X方向Checkbox */}
                        <Row style={{ marginTop: 16 }}>
                            <Col span={24}>
                                <Form.Item label={t('xDir')} labelCol={{ span: 3 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <Checkbox
                                        checked={X_DIR}
                                        onChange={(e) => {
                                            updateXDIR(e.target.checked);
                                            setX_DIR(e.target.checked);
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    {/* YZ方向配置 */}
                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ marginBottom: 16 }}>{t('adjustModal.yzDirectionConfig')}</h4>

                        {/* 第一行：AD选择 + Gain + 写入按钮 */}
                        <Row gutter={[16, 16]} align="middle">
                            {/* <Col span={8}>
                                <Form.Item label={t('adjustModal.adChannel')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <Select value={yzAdChannel} onChange={setYzAdChannel} style={{ width: '100%' }}>
                                        <Select.Option value="AD1">AD1</Select.Option>
                                        <Select.Option value="AD2">AD2</Select.Option>
                                        <Select.Option value="AD3">AD3</Select.Option>
                                        <Select.Option value="AD4">AD4</Select.Option>
                                        <Select.Option value="AD5">AD5</Select.Option>
                                        <Select.Option value="AD6">AD6</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col> */}
                            <Col span={16}>
                                <Form.Item label={t('adjustModal.yzGain')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <InputNumber
                                        value={yzGain}
                                        onChange={setYzGain}
                                        step={0.000000001}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" onClick={() => {
                                    try {
                                        const __channel = "control-message";
                                        const __type = "setYZGAIN";
                                        const data = {
                                            "__channel": __channel,
                                            "__type": __type,
                                            "GAIN": yzGain
                                        };

                                        wsService.sendMessage(data);


                                    } catch (error) {
                                        message.error(error.message);
                                    } finally {
                                    }
                                }}>
                                    {t('submit')}
                                </Button>
                            </Col>
                        </Row>

                        {/* 第二行：YZ方向Checkbox */}
                        <Row style={{ marginTop: 16 }}>
                            <Col span={24}>
                                <Form.Item label={t('yzDir')} labelCol={{ span: 3 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <Checkbox
                                        checked={Y_DIR}
                                        onChange={(e) => {
                                            updateYZDIR(e.target.checked);
                                            setY_DIR(e.target.checked);
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <div>

                        <h4 style={{ marginBottom: 16 }}>{t('DIR_FLAG')}</h4>
                        <Row gutter={[16, 16]} align="middle">
                            <Col span={16}>
                                <Form.Item label={t('AD1_DIR')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <Checkbox
                                        checked={AD1_DIR}
                                        onChange={(e) => {
                                            setAD1_DIR(e.target.checked);
                                            const __channel = "control-message";
                                            const __type = "setAD1_DIR";
                                            const data = {
                                                "__channel": __channel,
                                                "__type": __type,
                                                "on": e.target.checked
                                            };
                                            wsService.sendMessage(data);
                                        }}
                                    />

                                </Form.Item>
                                <Form.Item label={t('AD1_UPDN')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <Checkbox

                                        checked={AD1_UPDN}
                                        onChange={(e) => {
                                            setAD1_UPDN(e.target.checked);
                                            const __channel = "control-message";
                                            const __type = "setAD1_UPDN";
                                            const data = {
                                                "__channel": __channel,
                                                "__type": __type,
                                                "on": e.target.checked
                                            };
                                            wsService.sendMessage(data);
                                        }
                                        }
                                    />
                                </Form.Item>
                                <Form.Item label={t('AD2_UPDN')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <Checkbox

                                        checked={AD2_UPDN}
                                        onChange={(e) => {
                                            setAD2_UPDN(e.target.checked);
                                            const __channel = "control-message";
                                            const __type = "setAD2_UPDN";
                                            const data = {
                                                "__channel": __channel,
                                                "__type": __type,
                                                "on": e.target.checked
                                            };
                                            wsService.sendMessage(data);
                                        }
                                        }
                                    />
                                </Form.Item>


                                <Form.Item label={t('AD2_DIR')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>

                                    <Checkbox
                                        checked={AD2_DIR}
                                        onChange={(e) => {
                                            setAD2_DIR(e.target.checked);
                                            const __channel = "control-message";
                                            const __type = "setAD2_DIR";
                                            const data = {
                                                "__channel": __channel,
                                                "__type": __type,
                                                "on": e.target.checked
                                            };
                                            wsService.sendMessage(data);
                                        }}
                                    />

                                </Form.Item>
                            </Col>

                        </Row>
                    </div>


                </Col>
                <Col span={12}>


                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ marginBottom: 16 }}>{t('AD GAIN')}</h4>

                        {/* 第一行：AD选择 + Gain + 写入按钮 */}
                        <Row gutter={[16, 16]} align="middle">
                            <Col span={16}>
                                <Form.Item label={t('AD1')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <InputNumber
                                        value={AD_1_Gain}
                                        onChange={setAD_1_Gain}
                                        step={0.000000001}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" onClick={() => {
                                    try {
                                        const __channel = "control-message";
                                        const __type = "setADGAIN";
                                        const data = {
                                            "__channel": __channel,
                                            "__type": __type,
                                            "GAIN": AD_1_Gain,
                                            "AD": 1
                                        };

                                        wsService.sendMessage(data);


                                    } catch (error) {
                                        message.error(error.message);
                                    } finally {
                                    }
                                }}>
                                    {t('submit')}
                                </Button>
                            </Col>
                        </Row>

                        {/* 第二行：YZ方向Checkbox */}
                        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
                            <Col span={16}>
                                <Form.Item label={t('AD2')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <InputNumber
                                        value={AD_2_Gain}
                                        onChange={setAD_2_Gain}
                                        step={0.000000001}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" onClick={() => {
                                    try {
                                        const __channel = "control-message";
                                        const __type = "setADGAIN";
                                        const data = {
                                            "__channel": __channel,
                                            "__type": __type,
                                            "GAIN": AD_2_Gain,
                                            "AD": 2
                                        };

                                        wsService.sendMessage(data);


                                    } catch (error) {
                                        message.error(error.message);
                                    } finally {
                                    }
                                }}>
                                    {t('submit')}
                                </Button>
                            </Col>
                        </Row>
                    </div>









                    <div style={{ marginBottom: 32 }}>
                        <h4 style={{ marginBottom: 16 }}>{t('AD CAP')}</h4>

                        {/* 第一行：AD选择 + Gain + 写入按钮 */}
                        <Row gutter={[16, 16]} align="middle">
                            <Col span={16}>
                                <Form.Item label={t('AD1')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <InputNumber
                                        value={AD_1_CAP}
                                        onChange={setAD_1_CAP}
                                        step={0.000000001}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" onClick={() => {
                                    try {
                                        const __channel = "control-message";
                                        const __type = "setADCAP";
                                        const data = {
                                            "__channel": __channel,
                                            "__type": __type,
                                            "CAP": AD_1_CAP,
                                            "AD": 1
                                        };

                                        wsService.sendMessage(data);


                                    } catch (error) {
                                        message.error(error.message);
                                    } finally {
                                    }
                                }}>
                                    {t('submit')}
                                </Button>
                            </Col>
                        </Row>

                        {/* 第二行：YZ方向Checkbox */}
                        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
                            <Col span={16}>
                                <Form.Item label={t('AD2')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} style={{ marginBottom: 0 }}>
                                    <InputNumber
                                        value={AD_2_CAP}
                                        onChange={setAD_2_CAP}
                                        step={0.000000001}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" onClick={() => {
                                    try {
                                        const __channel = "control-message";
                                        const __type = "setADCAP";
                                        const data = {
                                            "__channel": __channel,
                                            "__type": __type,
                                            "CAP": AD_2_CAP,
                                            "AD": 2
                                        };

                                        wsService.sendMessage(data);


                                    } catch (error) {
                                        message.error(error.message);
                                    } finally {
                                    }
                                }}>
                                    {t('submit')}
                                </Button>
                            </Col>
                        </Row>
                    </div>


                </Col>


            </Row>
        </Modal>
    );
};

export default AdjustModal;