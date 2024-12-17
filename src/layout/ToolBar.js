import React, { useState } from 'react';

import { Button } from 'antd';
import { useTranslation } from "react-i18next";

import "../styles/layout.css";

const App = () => {

    const { t } = useTranslation();
    return <div className='toolbar' >
        <Button type='primary'>{t("home")}</Button>
        <Button type='primary'>{t("spin")}</Button>
        <Button type='primary'>{t("stop")}</Button>
        <Button type='primary'>{t("re-spin")}</Button>
    </div>;

};
export default App;