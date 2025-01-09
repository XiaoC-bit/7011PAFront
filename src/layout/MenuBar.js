import React, { useState } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useTranslation } from "react-i18next";
import ReportSettingModal from './ReportSettingModal';
import MethodListModal from './MethodListModal';
import ReportHistoryModal from './ReportHistoryModal';
import SaveMethodModal from './SaveMethodModal';

const App = () => {

    const { t } = useTranslation();

    const [isReportSettingModalVisible, setIsReportSettingModalVisible] = useState(false);
    const [isMethodListModalVisible, setIsMethodListModalVisible] = useState(false);
    const [isReportHistoryModalVisible, setIsReportHistoryModalVisible] = useState(false);
    const [isSaveMethodModalVisible, setIsSaveMethodModalVisible] = useState(false);


    const onClick = (e) => {
        if (e.key === 'report setting') {
            setIsReportSettingModalVisible(true);
        } else if (e.key === 'open method') {
            setIsMethodListModalVisible(true);
        } else if (e.key === 'report history') {
            setIsReportHistoryModalVisible(true);
        } else if (e.key === 'save method') {
            setIsSaveMethodModalVisible(true);
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
                // {
                //     label: t("report history"),
                //     key: "report history"
                // },
                {
                    label: t("export report"),
                    key: 'export report',
                },
                {
                    label: t("export data"),
                    key: 'export data',
                },
                {
                    label: t("print"),
                    key: 'print',
                },
                // {
                //     label: t("preview"),
                //     key: 'preview',
                // },
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


    return <>
        <Menu onClick={onClick} mode="horizontal" items={items} />
        <ReportSettingModal
            visible={isReportSettingModalVisible}
            onCancel={() => {
                setIsReportSettingModalVisible(false);
            }}
        />

        <MethodListModal
            visible={isMethodListModalVisible}
            onOk={() => {
                setIsMethodListModalVisible(false);
            }}
            onCancel={() => {
                setIsMethodListModalVisible(false);
            }}
        />

        <ReportHistoryModal
            visible={isReportHistoryModalVisible}
            onOk={() => {
                setIsReportHistoryModalVisible(false);
            }}
            onCancel={() => {
                setIsReportHistoryModalVisible(false);
            }}
        />


        <SaveMethodModal
            visible={isSaveMethodModalVisible}
            onSave={() => {
                setIsSaveMethodModalVisible(false);
            }}
            onCancel={() => {
                setIsSaveMethodModalVisible(false);
            }}
        />


    </>;
};
export default App;