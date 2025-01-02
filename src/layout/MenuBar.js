import React, { useState } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useTranslation } from "react-i18next";
import ReportSettingModal from './ReportSettingModal';

const App = () => {

    const { t } = useTranslation();

    const [isReportSettingModalVisible, setIsReportSettingModalVisible] = useState(false);

    const onClick = (e) => {
        if (e.key === 'report setting') {
            setIsReportSettingModalVisible(true);
        }
    };


    const items = [
        {
            label: t("file"),
            key: 'file',
            children: [
                {
                    label: t("open method"),
                    key: 'open method',
                },
                {
                    label: t("save method"),
                    key: 'save method',
                },
                {
                    label: t("export report"),
                    key: 'export report',
                },
                {
                    label: t("print"),
                    key: 'print',
                },
                {
                    label: t("preview"),
                    key: 'preview',
                },
                {
                    label: t("exit"),
                    key: 'exit',
                }
            ]
        },
        {
            label: t("edit"),
            key: 'edit',
            children: [
                {
                    label: t("report setting"),
                    key: 'report setting',
                }
            ]
        },
        {
            label: t("advance"),
            key: 'advance',
            children: [
                {
                    label: t("adjust"),
                    key: 'adjust',
                },
                {
                    label: t("PID"),
                    key: 'PID',
                }
            ]
        },
        {
            label: t("help"),
            key: 'help',
            children: [
                {
                    label: t("lanuage"),
                    key: 'lanuage',
                },
                {
                    label: t("version"),
                    key: 'version',
                }
            ]
        },
    ];


    return <>       <Menu onClick={onClick} mode="horizontal" items={items} />
        <ReportSettingModal
            visible={isReportSettingModalVisible}
            onOk={() => {
                setIsReportSettingModalVisible(false);
            }}
            onCancel={() => {
                setIsReportSettingModalVisible(false);
            }}
        /></>;
};
export default App;