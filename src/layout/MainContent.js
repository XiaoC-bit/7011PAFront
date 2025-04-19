import React, { useState } from "react";
import { Layout, Button } from "antd";
import {
    DoubleLeftOutlined,
    DoubleRightOutlined,
} from "@ant-design/icons";
import LeftPanel from "./LeftPanel";
import TestingContent from "./TestingContent";
import RightPanel from "./RightPanel";
const { Sider, Content } = Layout;



const App = () => {
    const [rightCollapsed, setRightCollapsed] = useState(false); // 右侧是否折叠

    return (
        <Layout style={{ height: "100vh", width: "100vw" }}>
            {/* 左侧配置区域 */}
            <Sider
                width={350}
                style={{ background: "#fff", padding: "5px" }}
                theme="light"
            >
                <LeftPanel />
            </Sider>

            {/* 中间 + 右侧组合区域 */}
            <Layout style={{ position: "relative" }}>
                {/* 中间内容 */}
                <Content
                    style={{
                        padding: "8px",
                        background: "#f0f2f5",
                        overflowY: "auto",
                    }}
                >
                    <TestingContent />
                </Content>

                {/* 折叠按钮（在右栏收起时显示） */}
                {rightCollapsed && (
                    <Button
                        icon={<DoubleLeftOutlined />}
                        onClick={() => setRightCollapsed(false)}
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 0,
                            zIndex: 1000,
                            borderRadius: "4px 0 0 4px",
                        }}
                    />
                )}

                {/* 右侧可折叠 Sider */}
                <Sider
                    width={300}
                    collapsed={rightCollapsed}
                    collapsedWidth={0}
                    theme="light"
                    style={{
                        background: "#fff",
                        transition: "all 0.3s",
                        borderLeft: "1px solid #f0f0f0",
                        position: "relative",
                        zIndex: 999,
                    }}
                    trigger={null}
                >
                    <RightPanel />
                    {/* 折叠按钮（右栏打开时显示） */}
                    <Button
                        icon={<DoubleRightOutlined />}
                        onClick={() => setRightCollapsed(true)}
                        style={{
                            position: "absolute",
                            top: 10,
                            left: -30,
                            zIndex: 1000,
                            borderRadius: "0 4px 4px 0",
                        }}
                    >
                    </Button>
                </Sider>
            </Layout>
        </Layout>
    );
};

export default App;
