import React, { useState } from "react";
import MenuBar from "./MenuBar";
import ToolBar from "./ToolBar";
import Info from "./Info";
import MainContent from "./MainContent";
import StatusBar from './StatusBar';

import '../styles/layout.css';

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
            <MenuBar className="flex-item" />
            <ToolBar className="flex-item" />
            <Info className="flex-item" statusData={sampleData}></Info>
            <MainContent className="flex-item main-content" />
            <StatusBar className="flex-item" hardwareInfo={hardwareInfo} />
        </div>
    );
};

export default Layout;
