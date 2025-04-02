import React, { useState, useEffect } from 'react';
import { Modal, InputNumber, Row, Col, message } from 'antd';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const PIDModal = ({ visible, onOk, onCancel }) => {

    const { t } = useTranslation();

    const [pid, setPid] = useState({
        PID_BANK: 0,
        PID_MODE: 0,
        PID_COMD: 0,
        PID_MSG: 0,
        IR_SPEED: 0,
        IR_POS: 0,
        KP: 0,
        KI: 0,
        KD: 0,
        S_I_LIM_PLUS: 0,
        S_I_LIM_MINUS: 0,
        PERIOD: 0,
        IR_TARGET: 0,
        FB_SOURCE: 0,
        REV_STOP: 0,
        SV_OFF_DELAY: 0,
        F_SOURCE: 0,
        IMPACT_TIMES: 0,
        IMPACT_LEVEL: 0,
        F_HOLD_UP: 0,
        PS_ACC_TIME: 0,
        PS_DEC_TIME: 0,
        PS_MODE: 0,
        DA_TYPE: 0,
        PS_PID_MIN: 0,
        PS_SP_LIM: 0,
        DA_OFFSET_PLUS: 0,
        DA_OFFSET_MINUS: 0,
        DA_FULL_SCALE: 0,
        DA_LIM_PLUS: 0,
        DA_LIM_MINUS: 0,
        DA_ACC_TIME: 0,
        DA_DEC_TIME: 0,
        DA_MODE: 0,
        KF: 0,
        DF_SIGNAL: 0,
        STOP_MODE: 0,
        CYCLE_KI: 0,
        CYCLE_RATE_MAX: 0,
        CYCLE_RATE_MIN: 0,
        SPEED_SIDE_KP: 0,
        DF_START_RATE: 0,
        AUTO_SIZE_KP: 0,
        AUTO_SIDE_MAX: 0,
        AUTO_SIDE_MIN: 0,
        KP_N: 0,
        IR_DC: 0,
        DA_LIM_P_V: 0,
        DA_LIM_N_V: 0,
        LOCK_RATE: 0,
        PULSE_RATE: 0,
        HALF_WAVE_RATIO: 0,
        MDR2_IR_F: 0,
        MDR2_KI: 0,
        SVON_HOLD_TIME: 0,
        RUN_OUT_LIM_OFF: 0
    });

    useEffect(() => {

        const readPIDData = async () => {
            const __channel = "pid-message";
            const __type = "read-data";
            const data = {
                "__channel": __channel,
                "__type": __type
            };

            wsService.sendMessage(data);

            const PIDData = await new Promise((resolve, reject) => {
                const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                    PubSub.unsubscribe(token);
                    if (data.status === 'success') {
                        resolve(data);
                    } else {
                        reject(new Error(t('pid read failed')));
                    }
                });
            });

            setPid(PIDData);

        };

        readPIDData();
    }, []);

    const handleChange = (key, value) => {
        setPid(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleOk = () => {
        const __channel = "pid-message";
        const __type = "write-data";
        const data = {
            "__channel": __channel,
            "__type": __type,
            pid
        };
        wsService.sendMessage(data);
        const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
            PubSub.unsubscribe(token);
            if (data.status === 'success') {
                message.success(t('pid write success'));
            } else {
                message.error(t('pid write failed'));
            }
        });
    };

    return (
        <Modal
            width={1000}
            visible={visible}
            title={t("PID Config")}
            okText={t("ok")}
            cancelText={t("cancel")}
            onCancel={onCancel}
            onOk={handleOk}
        >
            <Row gutter={16}>
                {Object.keys(pid).map(key => (
                    <Col span={6} key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', marginRight: '16px' }}>
                            <label style={{ width: '70%' }}>{key}:</label>
                            <InputNumber
                                value={pid[key]}
                                onChange={value => handleChange(key, value)}
                                style={{ width: '30%' }}
                                size="small"
                            />
                        </div>
                    </Col>
                ))}
            </Row>
        </Modal>
    );
};

export default PIDModal;