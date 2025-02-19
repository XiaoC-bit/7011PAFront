import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

const About = ({ visible, onOk, onCancel }) => {
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            title={t('title')}
            okText={t('okText')}
            onCancel={onCancel}
            onOk={onOk}
        >
            <p>{t('version')}: 1.0.0</p>
            <p>{t('company')}: GoTech.</p>
        </Modal>
    );
};

export default About;