// components/PasswordPromptModal.jsx
import React, { useState } from "react";
import { Modal, Input, message } from "antd";

const PasswordPromptModal = ({ visible, onSuccess, onCancel }) => {
    const [password, setPassword] = useState("");
    const correctPassword = "Advance"; // 你可以换成其他方式，比如从环境变量读

    const handleOk = () => {
        if (password === correctPassword) {
            onSuccess(); // 打开高级设置
            setPassword(""); // 清空密码
        } else {
            message.error("密码错误");
        }
    };

    return (
        <Modal
            title="请输入密码"
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText="确认"
            cancelText="取消"
            destroyOnClose
        >
            <Input.Password
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPressEnter={handleOk}
            />
        </Modal>
    );
};

export default PasswordPromptModal;
