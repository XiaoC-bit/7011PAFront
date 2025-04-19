import React, { useEffect, useState } from 'react';
import TestModeInfoPanel from './TestModeInfoPanel';

import { formState } from '../data/Data';
import { useAtom } from 'jotai';
const RightPanel = () => {

    const [formData, setFormData] = useAtom(formState);

    const [panelData, setPanelData] = useState({});

    useEffect(() => {
        setPanelData(formData.configForm);
    }, [formData]);
    return (
        <div style={{ padding: '16px', height: '100vh' }}>
            <TestModeInfoPanel formData={panelData} />
        </div>
    );
};

export default RightPanel;