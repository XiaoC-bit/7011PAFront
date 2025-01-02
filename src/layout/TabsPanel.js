import React from "react";
import { Tabs } from "antd";
import ConfigForm from "./ConfigForm";
import TestModeConfig from "./TestModeConfig";
import { useTranslation } from "react-i18next";

import '../styles/layout.css';

const { TabPane } = Tabs;

const TabsPanel = () => {
  const { t } = useTranslation();

  return (
    <Tabs defaultActiveKey="1" className="custom-tabs">
      <TabPane tab={t("generalParams")} key="1">
        <ConfigForm />
      </TabPane>
      <TabPane tab={t("testMode")} key="2">
        <TestModeConfig />
      </TabPane>
    </Tabs>
  );
};

export default TabsPanel;
