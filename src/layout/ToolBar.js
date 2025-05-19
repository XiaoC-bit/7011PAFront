import React, { useState } from 'react';
import { Button, message } from 'antd';
import { useTranslation } from "react-i18next";
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

import "../styles/layout.css";

const App = () => {
    const { t } = useTranslation();

    // 状态管理
    const [loadingSpin, setLoadingSpin] = useState(false);
    const [loadingRespin, setLoadingRespin] = useState(false);

    const clearLoading = () => {
        setLoadingSpin(false);
        setLoadingRespin(false);
    };

    const handleSpin = async () => {
        try {
            setLoadingSpin(true);
            const __channel = "control-message";
            const __type = "spin";
            const data = { "__channel": __channel, "__type": __type };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
            });
        } catch (error) {
            message.error(error.message);
            setLoadingSpin(false);
        }
    };

    const handleRespin = async () => {
        try {
            setLoadingRespin(true);
            const __channel = "control-message";
            const __type = "re-spin";
            const data = { "__channel": __channel, "__type": __type };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
            });
        } catch (error) {
            message.error(error.message);
            setLoadingRespin(false);
        }
    };

    const handleStop = async () => {
        try {
            const __channel = "control-message";
            const __type = "stop";
            const data = { "__channel": __channel, "__type": __type };

            wsService.sendMessage(data);
            clearLoading();

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                // if (data.status !== 'success') {
                //     message.error(t('stop failed'));
                // }
            });
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleHome = async () => {
        try {
            const __channel = "control-message";
            const __type = "home";
            const data = { "__channel": __channel, "__type": __type };

            wsService.sendMessage(data);
            clearLoading();

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                if (data.status !== 'success') {
                    message.error(t('home failed'));
                }
            });
        } catch (error) {
            message.error(error.message);
        }
    };

    return (
        <div className='toolbar'>
            <Button type='primary' onClick={handleHome}>{t("home")}</Button>
            <Button
                type='primary'
                onClick={handleSpin}
                loading={loadingSpin}
            >
                {t("spin")}
            </Button>
            <Button type='primary' onClick={handleStop}>
                {t("stop")}
            </Button>
            <Button
                type='primary'
                onClick={handleRespin}
                loading={loadingRespin}
            >
                {t("re-spin")}
            </Button>
        </div>
    );
};

export default App;
