import React from "react";
import { Layout } from "antd";
import LeftPanel from "./LeftPanel";
import TestingContent from "./TestingContent";
const { Content } = Layout;

const App = () => {
    return (
        <Layout >
            {/* 左侧配置区域 */}
            <LeftPanel />

            {/* 右侧展示区域，预留 */}
            <Content style={{ padding: "8px", background: "#f0f2f5", overflowY: "auto" }}>
                <TestingContent />
            </Content>
        </Layout>
    );
};

export default App;
