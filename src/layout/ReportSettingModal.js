import React, { useEffect, useState } from 'react';
import { Modal, Button, Tree, InputNumber, Space, message, Row, Col } from 'antd';
import { UpOutlined, DownOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';
import '../styles/layout.css';

const ReportSettingModal = ({ visible, onCancel }) => {
    const { t } = useTranslation();
    const [targetKeys, setTargetKeys] = useState([]);
    const [selectedTreeKeys, setSelectedTreeKeys] = useState([]);
    const [leftSelectedKeys, setLeftSelectedKeys] = useState([]);
    const [customItems, setCustomItems] = useState([]);
    const [torqueValue, setTorqueValue] = useState(null);
    const [angleValue, setAngleValue] = useState(null);
    const [angle1, setStiffnessValue1] = useState(null);
    const [angle2, setStiffnessValue2] = useState(null);

    const basicInfoItems = [
        { key: 'specimenName', title: t('specimenName') },
        { key: 'specimenNumber', title: t('specimenNumber') },
        { key: 'batchNumber', title: t('batchNumber') },
        { key: 'productionDate', title: t('productionDate') },
        { key: 'operator', title: t('operator') },
        { key: 'labTemperature', title: t('labTemperature') },
        { key: 'labHumidity', title: t('labHumidity') },
        { key: 'remarks', title: t('remarks') },
    ];

    const testDataItems = [
        { key: 'maxTorque', title: t('maxTorque') },
        { key: 'maxAngle', title: t('maxAngle') },
        // { key: 'torsionalStiffness', title: t('torsionalStiffness') },
    ];

    const handleLeftSelect = (keys) => {
        setLeftSelectedKeys(keys);
        setSelectedTreeKeys([]); // 清除右边树的选中状态
    };

    const handleRightSelect = (keys) => {
        setSelectedTreeKeys(keys);
        setLeftSelectedKeys([]); // 清除左边树的选中状态
    };

    const addItem = (key) => {
        if (!targetKeys.includes(key)) {
            setTargetKeys([...targetKeys, key]);
        }
    };

    const addSelectedItems = () => {
        leftSelectedKeys.forEach(key => addItem(key));
    };

    const moveUp = () => {
        const newTargetKeys = [...targetKeys];
        selectedTreeKeys.forEach(key => {
            const index = newTargetKeys.indexOf(key);
            if (index > 0) {
                [newTargetKeys[index - 1], newTargetKeys[index]] = [newTargetKeys[index], newTargetKeys[index - 1]];
            }
        });
        setTargetKeys(newTargetKeys);
    };

    const moveDown = () => {
        const newTargetKeys = [...targetKeys];
        selectedTreeKeys.slice().reverse().forEach(key => {
            const index = newTargetKeys.indexOf(key);
            if (index < newTargetKeys.length - 1) {
                [newTargetKeys[index + 1], newTargetKeys[index]] = [newTargetKeys[index], newTargetKeys[index + 1]];
            }
        });
        setTargetKeys(newTargetKeys);
    };

    const removeItem = () => {
        const newTargetKeys = targetKeys.filter(key => !selectedTreeKeys.includes(key));
        setTargetKeys(newTargetKeys);
        setCustomItems(customItems.filter(item => !selectedTreeKeys.includes(item.key)));
    };


    const addCustomItem = (type, value, value2 = null) => {
        // alert(cycleCount);
        if (value === null || value === undefined || value === '') {
            message.warning(t('valueCannotBeEmpty'));
            return;
        }
        let title = "";
        let key = `${type}-${value}-${cycleCount}`;
        if (type === 'torque') {
            title = `循环[${cycleCount}]扭力[${value}N]对应的角度值`;
        }
        else if (type === 'angle') {
            title = `循环[${cycleCount}]角度[${value}]对应的扭矩值`;
        }
        else if (type === 'stiffness') {
            title = `循环[${cycleCount}]扭转刚度[${value}, ${value2}]`;
            key = `${type}-${value}-${value2}-${cycleCount}`;


            if (value2 === null || value2 === undefined || value2 === '') {
                message.warning(t('valueCannotBeEmpty'));
                return;
            }

        }
        if (targetKeys.includes(key)) {
            message.warning(t('itemAlreadyExists'));
            return;
        }
        //const title = type === 'torque' ? `扭力[${value}N]对应的角度值` : `角度[${value}]对应的扭矩值`;
        const newCustomItem = { key, title };
        setCustomItems([...customItems, newCustomItem]);
        setTargetKeys([...targetKeys, key]);
    };


    const isMoveUpDisabled = selectedTreeKeys.some(key => targetKeys.indexOf(key) === 0);
    const isMoveDownDisabled = selectedTreeKeys.some(key => targetKeys.indexOf(key) === targetKeys.length - 1);

    const leftTreeData = [
        {
            title: t('basicInfo'),
            key: 'basicInfo',
            children: basicInfoItems.map(item => ({ title: item.title, key: item.key })),
        },
        {
            title: t('testData'),
            key: 'testData',
            children: testDataItems.map(item => ({ title: item.title, key: item.key })),
        },
    ];

    const rightTreeData = targetKeys.map(key => {
        const item = basicInfoItems.find(item => item.key === key) || testDataItems.find(item => item.key === key) || customItems.find(item => item.key === key);
        return { title: item.title, key: item.key };
    });

    const fetchData = async () => {
        try {
            const __channel = "config-report-message";
            const __type = "fetchData";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const response = await new Promise((resolve, reject) => {
                const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                    PubSub.unsubscribe(token);
                    if (data.status === 'success') {
                        resolve(data);
                    } else {
                        reject(new Error(t('fetchFailed')));
                    }
                });
            });

            let tmpCustomItems = [];
            response.reportMetas.forEach(meta => {
                if (meta.startsWith('angle-') || meta.startsWith('torque-')) {
                    const [type, value, cycleCountTmp] = meta.split('-');
                    const title = type === 'torque' ? `循环[${cycleCountTmp}]扭力[${value}N]对应的角度值` : `循环[${cycleCountTmp}]角度[${value}]对应的扭矩值`;
                    const key = `${type}-${value}-${cycleCountTmp}`;
                    const newCustomItem = { key, title };
                    tmpCustomItems.push(newCustomItem);
                }
                else if (meta.startsWith('stiffness-')) {
                    const [type, value1, value2, cycleCountTmp] = meta.split('-');
                    const title = `循环[${cycleCountTmp}]扭转刚度[${value1}, ${value2}]`;
                    const key = `${type}-${value1}-${value2}-${cycleCountTmp}`;
                    const newCustomItem = { key, title };
                    tmpCustomItems.push(newCustomItem);
                }
            });
            setCustomItems(tmpCustomItems);
            setTargetKeys(response.reportMetas);
            await new Promise(resolve => setTimeout(resolve, 0));


        } catch (error) {
            message.error(error.message || t('fetchFailed'));
        } finally {
        }
    };

    useEffect(() => {
        if (visible) {
            fetchData();
        };
    }, [visible]);

    const onOk = async () => {

        try {

            const __channel = "config-report-message";
            const __type = "addData";
            const data = {
                "__channel": __channel,
                "__type": __type,
                "reportMetas": targetKeys,
            };

            wsService.sendMessage(data);


            const response = await new Promise((resolve, reject) => {
                const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                    PubSub.unsubscribe(token);
                    if (data.status === 'success') {
                        resolve(data);
                    } else {
                        reject(new Error(t('addFailed')));
                    }
                });
            });

            message.success(t('addSuccess'));


        } catch (error) {
            message.error(error.message);
        } finally {
            onCancel();
        }


    };

    const [cycleCount, setCycleCount] = useState(0);

    return (
        <Modal
            title={t('reportSetting')}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={800} // 调整Modal的宽度
            footer={[
                <Button key="cancel" onClick={onCancel}>{t('cancel')}</Button>,
                <Button key="ok" type="primary" onClick={onOk}>{t('ok')}</Button>,
            ]}
        >
            <div className="transfer-container">
                <Tree
                    treeData={leftTreeData}
                    selectable
                    selectedKeys={leftSelectedKeys}
                    onSelect={handleLeftSelect}
                    onDoubleClick={(event, node) => addItem(node.key)}
                    titleRender={(node) => (
                        <span style={{ color: targetKeys.includes(node.key) ? 'gray' : 'inherit' }}>
                            {node.title}
                        </span>
                    )}
                    className="transfer-tree"
                    defaultExpandAll // 默认展开所有节点
                />
                <div className="transfer-buttons">
                    <Button onClick={addSelectedItems} disabled={leftSelectedKeys.length === 0}>
                        <PlusOutlined />
                    </Button>
                    <Button onClick={moveUp} disabled={selectedTreeKeys.length === 0 || isMoveUpDisabled}>
                        <UpOutlined />
                    </Button>
                    <Button onClick={moveDown} disabled={selectedTreeKeys.length === 0 || isMoveDownDisabled}>
                        <DownOutlined />
                    </Button>
                    <Button onClick={removeItem} disabled={selectedTreeKeys.length === 0}>
                        <MinusCircleOutlined />
                    </Button>
                </div>
                <Tree
                    treeData={rightTreeData}
                    selectedKeys={selectedTreeKeys}
                    onSelect={handleRightSelect}
                    className="transfer-tree"
                />
            </div>

            <Row justifyContent="center" alignItems="center" >
                <Col span={2}><span>{t('cycleCount')}</span></Col>
                <Col>
                    <InputNumber
                        precision={0}
                        min={0}
                        max={1000}
                        placeholder={t('cycleCount')}
                        value={cycleCount}
                        onChange={setCycleCount}
                        style={{ width: '80px' }}
                    /></Col>
            </Row>


            <Space style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <Space style={{ display: 'flex', gap: '8px' }}>
                    <InputNumber
                        placeholder={t('torqueValue')}
                        value={torqueValue}
                        onChange={setTorqueValue}
                        style={{ width: '80px' }}
                    />
                    <Button
                        type="dashed"
                        onClick={() => {
                            if (cycleCount === null || cycleCount === undefined || cycleCount === '') {
                                message.warning(t("cycleCountCannotBeZero"));
                                return;
                            }
                            addCustomItem('torque', torqueValue);
                            setTorqueValue(null);
                        }}
                        style={{ width: '200px' }}
                    >
                        <PlusOutlined /> {t('addTorqueAnglePair')}
                    </Button>
                </Space>
                <Space style={{ display: 'flex', gap: '8px' }}>
                    <InputNumber
                        placeholder={t('angleValue')}
                        value={angleValue}
                        onChange={setAngleValue}
                        style={{ width: '80px' }}
                    />
                    <Button
                        type="dashed"
                        onClick={() => {
                            addCustomItem('angle', angleValue);
                            setAngleValue(null);
                        }}
                        style={{ width: '200px' }}
                    >
                        <PlusOutlined /> {t('addAngleTorquePair')}
                    </Button>
                </Space>
            </Space>



            <Space style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <Space style={{ display: 'flex', gap: '8px' }}>
                    <InputNumber
                        placeholder={t('angle1')}
                        value={angle1}
                        onChange={setStiffnessValue1}
                        style={{ width: '80px' }}
                    />
                    <InputNumber
                        placeholder={t('angle2')}
                        value={angle2}
                        onChange={setStiffnessValue2}
                        style={{ width: '80px' }}
                    />
                    <Button
                        type="dashed"
                        onClick={() => {
                            // if (angle1 < angle2) {
                            //     message.warning(t("angle1MustBeGreaterThanAngle2"));
                            //     return;
                            // }
                            addCustomItem('stiffness', angle1, angle2);
                            setStiffnessValue1(null);
                            setStiffnessValue2(null);
                        }}
                        style={{ width: '200px' }}
                    >
                        <PlusOutlined /> {t('addStiffnessPair')}
                    </Button>
                </Space>
            </Space>

        </Modal>
    );
};

export default ReportSettingModal;