import React from 'react';
import { Layout, Row, Col, Space, Tag, Tooltip } from 'antd';

const { Footer } = Layout;

const StatusBar = ({ hardwareInfo }) => {
    return (
        <Footer style={{ background: '#f0f2f5', padding: '10px 50px', textAlign: 'center' }}>
            <Row gutter={24}>
                <Col span={6}>
                    <Space>
                        <Tooltip title="CPU Usage">
                            <Tag color="blue">CPU: {hardwareInfo.cpuUsage}%</Tag>
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={6}>
                    <Space>
                        <Tooltip title="Memory Usage">
                            <Tag color="green">Memory: {hardwareInfo.memoryUsage}%</Tag>
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={6}>
                    <Space>
                        <Tooltip title="Disk Space">
                            <Tag color="orange">Disk: {hardwareInfo.diskUsage}%</Tag>
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={6}>
                    <Space>
                        <Tooltip title="Network Status">
                            <Tag color="purple">Network: {hardwareInfo.networkStatus}</Tag>
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
        </Footer>
    );
};

export default StatusBar;
