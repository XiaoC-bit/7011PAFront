import React, { useState } from 'react';

import { Button, message } from 'antd';
import { useTranslation } from "react-i18next";
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

import "../styles/layout.css";

const App = () => {

    const { t } = useTranslation();

    const handleSpin = async () => {
        try {
            const __channel = "control-message";
            const __type = "spin";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                if (data.status === 'success') {
                    //message.success(t('spin success'));
                } else {
                    message.error(t('spin failed'));
                }
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };

    const handleHome = async () => {
        try {
            const __channel = "control-message";
            const __type = "home";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                if (data.status === 'success') {
                    // message.success(t('home success'));
                } else {
                    message.error(t('home failed'));
                }
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };

    const handleStop = async () => {
        try {
            const __channel = "control-message";
            const __type = "stop";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                if (data.status === 'success') {
                    //message.success(t('stop success'));
                } else {
                    message.error(t('stop failed'));
                }
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };

    const handleRespin = async () => {
        try {
            const __channel = "control-message";
            const __type = "re-spin";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                if (data.status === 'success') {
                    // message.success(t('re-spin success'));
                } else {
                    message.error(t('re-spin failed'));
                }
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };


    return <div className='toolbar' >
        <Button type='primary' onClick={handleHome}>{t("home")}</Button>
        <Button type='primary' onClick={handleSpin}>{t("spin")}</Button>
        <Button type='primary' onClick={handleStop}>{t("stop")}</Button>
        <Button type='primary' onClick={handleRespin}>{t("re-spin")}</Button>
    </div>;

};
export default App;