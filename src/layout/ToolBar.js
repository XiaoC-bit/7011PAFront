import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { useTranslation } from "react-i18next";
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

import "../styles/layout.css";

const App = () => {
    const { t } = useTranslation();

    const [loadingRelease, setLoadingRelease] = useState(false);
    const [loadingMoveDown, setLoadingMoveDown] = useState(false);

    const clearLoading = () => {
        setLoadingRelease(false);
        setLoadingMoveDown(false);
    };

    // 页面加载完成后，自动发送 stop
    useEffect(() => {
        const timer = setTimeout(() => {
            handleStop();
        }, 3000); // 延迟 3000 毫秒（即 3 秒）

        return () => clearTimeout(timer); // 清理定时器，避免组件卸载时报错
    }, []);

    const sendControlMessage = async (type, setLoading) => {
        try {
            setLoading?.(true);
            const __channel = "control-message";
            const data = { "__channel": __channel, "__type": type };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(`${__channel}-${type}`, (_, data) => {
                PubSub.unsubscribe(token);
                // 如果有必要可以在此处理data
            });
        } catch (error) {
            message.error(error.message);
        } finally {
            //setLoading?.(false);
        }
    };

    const handleGrip = () => {
        const __channel = "control-message";
        const __type = "grip";
        const data = { "__channel": __channel, "__type": __type };

        wsService.sendMessage(data);
        clearLoading();

        const token = PubSub.subscribe(`${__channel}-${__type}`, (_, data) => {
            PubSub.unsubscribe(token);
        });
    };

    const handleRelease = () => {
        sendControlMessage("release", setLoadingRelease);
    };

    const handleMoveUp = () => {
        const __channel = "control-message";
        const __type = "move-up";
        const data = { "__channel": __channel, "__type": __type };

        wsService.sendMessage(data);
        clearLoading();

        const token = PubSub.subscribe(`${__channel}-${__type}`, (_, data) => {
            PubSub.unsubscribe(token);
        });
    };

    const handleMoveDown = () => {
        sendControlMessage("move-down", setLoadingMoveDown);
    };

    const handleStop = () => {
        const __channel = "control-message";
        const __type = "stop";
        const data = { "__channel": __channel, "__type": __type };

        wsService.sendMessage(data);
        clearLoading();

        const token = PubSub.subscribe(`${__channel}-${__type}`, (_, data) => {
            PubSub.unsubscribe(token);
        });
    };

    return (
        <div className='toolbar'>
            <Button type='primary' onClick={handleGrip}>
                {t("grip")}
            </Button>

            <Button
                type='primary'
                onMouseDown={handleRelease}
                onMouseUp={handleStop}
                loading={loadingRelease}
            >
                {t("release")}
            </Button>

            <Button type='primary' onClick={handleMoveUp}>
                {t("move-up")}
            </Button>

            <Button
                type='primary'
                onMouseDown={handleMoveDown}
                onMouseUp={handleStop}
                loading={loadingMoveDown}
            >
                {t("move-down")}
            </Button>

            <Button
                type='primary'
                onClick={handleStop}
            >
                {t("stop")}
            </Button>
        </div>
    );
};

export default App;
