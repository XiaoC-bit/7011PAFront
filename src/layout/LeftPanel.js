import React from "react";
import { Layout, Tabs } from "antd";
import TabsPanel from "./TabsPanel";
import '../styles/layout.css';

const { Sider } = Layout;

const LeftPanel = () => {
    return (
        <Sider className="tabs-panel" width="30%" style={{ background: "#fff", padding: "5px" }}>
            <TabsPanel />
        </Sider>
    );
};

export default LeftPanel;
