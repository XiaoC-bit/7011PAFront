import React, { useEffect, useState } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu, message, Modal } from 'antd';
import { useTranslation } from "react-i18next";
import ReportSettingModal from './ReportSettingModal';
import MethodListModal from './MethodListModal';
import ReportHistoryModal from './ReportHistoryModal';
import SaveMethodModal from './SaveMethodModal';
import MethodNameModal from './MethodNameModal';
import PIDModal from './PIDModal';
import About from './About';
import LanguageModal from './LanguageModal';
import AdjustModal from './AdjustModal';
import { formState, currentMethod } from '../data/Data';
import { useAtom } from 'jotai';

const App = () => {

    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(formState);
    const [method, setMethod] = useAtom(currentMethod);

    const [isReportSettingModalVisible, setIsReportSettingModalVisible] = useState(false);
    const [isMethodListModalVisible, setIsMethodListModalVisible] = useState(false);
    const [isReportHistoryModalVisible, setIsReportHistoryModalVisible] = useState(false);
    const [isSaveMethodModalVisible, setIsSaveMethodModalVisible] = useState(false);
    const [isMethodNameModalVisible, setIsMethodNameModalVisible] = useState(false);
    const [isPIDModalVisible, setIsPIDModalVisible] = useState(false);
    const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
    const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false);

    const [isSaveAs, setIsSaveAs] = useState(false);

    const [disabledSave, setIsDisabledSave] = useState(false);
    const [disableNew, setIsDisableNew] = useState(false);

    useEffect(() => {
        setIsDisableNew(method === '');
    }, [method]);

    useEffect(() => {
        setIsDisabledSave(formData.dirty === false);
    }, [formData]);

    const onClick = (e) => {
        if (e.key === "new method") {
            if (formData.dirty === true) {
                message.warning(t('pleaseSaveMethod'));
            }
            else {
                setIsMethodNameModalVisible(true);
            }
        }
        else if (e.key === 'report setting') {
            setIsReportSettingModalVisible(true);
        } else if (e.key === 'open method') {
            setIsMethodListModalVisible(true);
        } else if (e.key === 'report history') {
            setIsReportHistoryModalVisible(true);
        } else if (e.key === 'save as') {
            setIsSaveAs(true);
            setIsSaveMethodModalVisible(true);
        }
        else if (e.key === 'save method') {
            setIsSaveAs(false);
            setIsSaveMethodModalVisible(true);
        }
        else if (e.key === 'PID') {
            setIsPIDModalVisible(true);
        }
        else if (e.key === 'exit') {
            //window.close();
        }
        else if (e.key === 'version') {
            setIsAboutModalVisible(true);
        }
        else if (e.key === 'lanuage') {
            setIsLanguageModalVisible(true);
        } else if (e.key === 'adjust') {
            setIsAdjustModalVisible(true);
        }
        else if (e.key === 'print') {
            window.print();
        }
    };


    const items = [
        {
            label: t("file"),
            key: 'file',
            children: [
                {
                    label: t("new method"),
                    key: 'new method',
                    disabled: disableNew
                },
                {
                    label: t("open method"),
                    key: 'open method'
                },
                {
                    label: t("save method"),
                    key: 'save method',
                    disabled: disabledSave
                },
                // {
                //     label: t("save as"),
                //     key: 'save as',
                // },
                {
                    label: t("report history"),
                    key: "report history"
                },
                // {
                //     label: t("export report"),
                //     key: 'export report',
                // },
                // {
                //     label: t("export data"),
                //     key: 'export data',
                // },
                {
                    label: t("print"),
                    key: 'print',
                },
                // {
                //     label: t("preview"),
                //     key: 'preview',
                // },
                // {
                //     label: t("exit"),
                //     key: 'exit',
                // }
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
        <Menu onClick={onClick} mode="horizontal" items={items} triggerSubMenuAction={'click'} />
        <ReportSettingModal
            visible={isReportSettingModalVisible}
            onCancel={() => {
                setIsReportSettingModalVisible(false);
            }}
        />
        <MethodNameModal

            visible={isMethodNameModalVisible}
            onOk={() => {
                setIsMethodNameModalVisible(false);
            }}
            onCancel={() => {
                setIsMethodNameModalVisible(false);
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
            height={"90vh"}
            width={"100%"}
        />


        <SaveMethodModal
            visible={isSaveMethodModalVisible}
            isSaveAs={isSaveAs}
            onSave={() => {
                setIsSaveMethodModalVisible(false);
            }}
            onCancel={() => {
                setIsSaveMethodModalVisible(false);
            }}
        />
        <PIDModal
            visible={isPIDModalVisible}
            onOk={() => {
                setIsPIDModalVisible(false);
            }}
            onCancel={() => {
                setIsPIDModalVisible(false);
            }}
        />
        <About
            visible={isAboutModalVisible}
            onOk={() => {
                setIsAboutModalVisible(false);
            }}
            onCancel={() => {
                setIsAboutModalVisible(false);
            }}
        />


        <LanguageModal
            visible={isLanguageModalVisible}
            onOk={() => {
                setIsLanguageModalVisible(false);
            }}
            onCancel={() => {
                setIsLanguageModalVisible(false);
            }}
        />

        <AdjustModal
            visible={isAdjustModalVisible}
            onOk={() => {
                setIsAdjustModalVisible(false);
            }}
            onCancel={() => {
                setIsAdjustModalVisible(false);
            }}
        />

    </>;
};
export default App;