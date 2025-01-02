import React, { useState } from 'react';
import { Modal, Button, Tree, InputNumber, Space, message } from 'antd';
import { UpOutlined, DownOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '../styles/layout.css';

const ReportSettingModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    const [targetKeys, setTargetKeys] = useState([]);
    const [selectedTreeKeys, setSelectedTreeKeys] = useState([]);
    const [leftSelectedKeys, setLeftSelectedKeys] = useState([]);
    const [customItems, setCustomItems] = useState([]);
    const [torqueValue, setTorqueValue] = useState(null);
    const [angleValue, setAngleValue] = useState(null);

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
        { key: 'torsionalStiffness', title: t('torsionalStiffness') },
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

    const addCustomItem = (type, value) => {
        if (value === null || value === undefined || value === '') {
            message.warning(t('valueCannotBeEmpty'));
            return;
        }
        const key = `${type}-${value}`;
        if (targetKeys.includes(key)) {
            message.warning(t('itemAlreadyExists'));
            return;
        }
        const title = type === 'torque' ? `扭力[${value}N]对应的角度值` : `角度[${value}]对应的扭矩值`;
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

    return (
        <Modal
            title={t('reportSetting')}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            width={800} // 调整Modal的宽度
            bodyStyle={{ height: '600px', overflowY: 'auto' }} // 设置内容区域高度
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
        </Modal>
    );
};

export default ReportSettingModal;