import React from "react";
import { Layout, Tabs } from "antd";
import TabsPanel from "./TabsPanel";

const { Sider } = Layout;

const LeftPanel = () => {
    return (
        <Sider width="30%" style={{ background: "#fff", padding: "16px" }}>
            <TabsPanel />
        </Sider>
    );
};

export default LeftPanel;
