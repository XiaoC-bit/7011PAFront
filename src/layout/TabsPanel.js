import React, { useEffect } from "react";
import { Tabs, Form, message } from "antd";
import ConfigForm from "./ConfigForm";
import TestModeConfig from "./TestModeConfig";
import { useTranslation } from "react-i18next";

import { formState, hasChangeMethodState } from '../data/Data';
import { useAtom } from 'jotai';
import { pick, isEqual } from 'lodash';
import '../styles/layout.css';

const { TabPane } = Tabs;

const TabsPanel = () => {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const [formData, setFormData] = useAtom(formState);
  const [hasChangeMethod, setHasChangeMethod] = useAtom(hasChangeMethodState);

  useEffect(() => {
    form.setFieldsValue({
      ...formData.configForm,
      ...formData.testModeConfig,
    });
  }, [formData, form]);

  const handleValuesChange = (changedValues, allValues) => {

    const fullValues = form.getFieldsValue(true); // 获取所有字段，不管是否渲染
    const initial = formData.testModeConfigInitial || {};

    const dirty = !isEqual(pick(initial, Object.keys(fullValues)), fullValues);
    setFormData((prevState) => ({
      ...prevState,
      testModeConfig: fullValues,
      configForm: fullValues,
      dirty
    }));
    setHasChangeMethod(true);
    //message.warning(dirty);

    return;
    // const initial = formData.testModeConfigInitial || {};

    // const dirty = !isEqual(pick(initial, Object.keys(allValues)), allValues);
    // setFormData((prevState) => ({
    //   ...prevState,
    //   testModeConfig: allValues,
    //   configForm: allValues,
    //   dirty
    // }));

  };

  return (


    <Form
      className="config-form"
      form={form}
      layout="vertical"
      // initialValues={{
      //     initialLoadTorque: 0,
      //     initialLoadAngle: 0,
      //     initialLoadDisplacement: 0,
      // }}
      onValuesChange={handleValuesChange}
    >
      <Tabs defaultActiveKey="1" className="custom-tabs" destroyInactiveTabPane={false}>
        <TabPane tab={t("generalParams")} key="1">
          <ConfigForm />
        </TabPane>
        <TabPane tab={t("testMode")} key="2">
          <TestModeConfig />
        </TabPane>
      </Tabs>
    </Form>
  );
};

export default TabsPanel;
