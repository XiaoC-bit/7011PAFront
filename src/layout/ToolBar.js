import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { useTranslation } from "react-i18next";
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

import "../styles/layout.css";

const App = () => {
    const { t } = useTranslation();

    const [loadingSpin, setLoadingSpin] = useState(false);
    const [loadingRespin, setLoadingRespin] = useState(false);

    const clearLoading = () => {
        setLoadingSpin(false);
        setLoadingRespin(false);
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

    const handleSpinDown = () => {
        sendControlMessage("spin", setLoadingSpin);
    };

    const handleRespinDown = () => {
        sendControlMessage("re-spin", setLoadingRespin);
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

    const handleHome = () => {
        const __channel = "control-message";
        const __type = "home";
        const data = { "__channel": __channel, "__type": __type };

        wsService.sendMessage(data);
        clearLoading();

        const token = PubSub.subscribe(`${__channel}-${__type}`, (_, data) => {
            PubSub.unsubscribe(token);
            if (data.status !== 'success') {
                //message.error(t('home failed'));
            }
        });
    };

    return (
        <div className='toolbar'>
            <Button type='primary' onClick={handleHome}>
                {t("home")}
            </Button>

            <Button
                type='primary'
                onMouseDown={handleSpinDown}
                onMouseUp={handleStop}
                loading={loadingSpin}
            >
                {t("spin")}
            </Button>

            <Button
                type='primary'
                onClick={handleStop}
            >
                {t("stop")}
            </Button>

            <Button
                type='primary'
                onMouseDown={handleRespinDown}
                onMouseUp={handleStop}
                loading={loadingRespin}
            >
                {t("re-spin")}
            </Button>
        </div>
    );
};

export default App;
