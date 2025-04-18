import React from "react";
import { Layout } from "antd";
import LeftPanel from "./LeftPanel";
import TestingContent from "./TestingContent";
const { Content } = Layout;
const { Sider } = Layout;

const App = () => {
    return (
        <Layout style={{ width: "100wh" }}>
            {/* 左侧配置区域 */}
            <Sider className="tabs-panel" width="350" style={{ background: "#fff", padding: "5px" }}>
                <LeftPanel />
            </Sider>


            {/* 右侧展示区域，预留 */}
            <Content style={{ padding: "8px", background: "#f0f2f5", overflowY: "auto" }}>
                <TestingContent />
            </Content>
        </Layout>
    );
};

export default App;
