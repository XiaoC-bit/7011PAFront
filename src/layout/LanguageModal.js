import React, { useState } from 'react';
import { Modal, Radio, message } from 'antd';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const LanguageModal = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);

    const handleLanguageChange = e => {
        setLanguage(e.target.value);
    };

    const handleOk = async () => {

        try {
            const __channel = "config-system-message";
            const __type = "changeLanguage";
            const data = {
                "__channel": __channel,
                "__type": __type,
                language
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                i18n.changeLanguage(language);
                onOk();
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }

    };

    return (
        <Modal
            visible={visible}
            title={t('select language')}
            okText={t('okText')}
            cancelText={t('cancel')}
            onCancel={onCancel}
            onOk={handleOk}
        >
            <Radio.Group onChange={handleLanguageChange} value={language}>
                <Radio value="zh">中文简体</Radio>
                <Radio value="zh-TW">中文繁體</Radio>
                <Radio value="en">english</Radio>
                <Radio value="other">other</Radio>
            </Radio.Group>
        </Modal>
    );
};

export default LanguageModal;