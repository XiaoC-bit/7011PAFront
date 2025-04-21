import React, { useState } from "react";
import MenuBar from "./MenuBar";
import ToolBar from "./ToolBar";
import Info from "./Info";
import MainContent from "./MainContent";
import StatusBar from './StatusBar';

import '../styles/layout.css';
import { Flex } from 'antd';

const Layout = () => {

    // 示例数据
    const sampleData = {
        torque: 120,
        angle: 45,
        axialDisplacement: 10,
        twistCount: 5,
        testTime: '01:15:30', // 测试时间格式
    };

    const [hardwareInfo, setHardwareInfo] = useState({
        cpuUsage: 45,
        memoryUsage: 70,
        diskUsage: 50,
        networkStatus: 'Connected',
    });

    return (
        <div className="layout-container">
            <div style={{ height: 40, backgroundColor: '#001529', minHeight: 0 }} >
                <MenuBar />
            </div>

            <div className="toolbar-info-container"
                style={{ height: 80, backgroundColor: 'InfoBackground' }}

            >
                <ToolBar className="flex-item" />
                <Info className="flex-item" statusData={sampleData} />
            </div>
            {/* <ToolBar className="flex-item" />
            <Info className="flex-item" statusData={sampleData}></Info> */}

            <MainContent className="flex-item main-content" />
            <div style={{ height: 50, backgroundColor: 'StatusBarBackground' }}>

                <StatusBar

                    hardwareInfo={hardwareInfo} />
            </div>
        </div>
    );
};

export default Layout;
