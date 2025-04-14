import React, { useState, useEffect } from 'react';
import { Modal, InputNumber, Row, Col, message, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const PIDModal = ({ visible, onOk, onCancel }) => {

    const { t } = useTranslation();

    const [pid, setPid] = useState({
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

    const [group, setGroup] = useState(0);

    useEffect(() => {
        readPIDData();
    }, [group]);


    const readPIDData = async () => {
        const __channel = "pid-message";
        const __type = "read-data";
        const data = {
            "__channel": __channel,
            "__type": __type,
            "group": group
        };

        wsService.sendMessage(data);

        const PIDData = await new Promise((resolve, reject) => {
            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                resolve(data);
            });
        });
        //PIDData
        setPid(
            {
                PID_MODE: PIDData.PID_MODE,
                PID_COMD: PIDData.PID_COMD,
                PID_MSG: PIDData.PID_MSG,
                IR_SPEED: PIDData.IR_SPEED,
                IR_POS: PIDData.IR_POS,
                KP: PIDData.KP,
                KI: PIDData.KI,
                KD: PIDData.KD,
                S_I_LIM_PLUS: PIDData.S_I_LIM_PLUS,
                S_I_LIM_MINUS: PIDData.S_I_LIM_MINUS,
                PERIOD: PIDData.PERIOD,
                IR_TARGET: PIDData.IR_TARGET,
                FB_SOURCE: PIDData.FB_SOURCE,
                REV_STOP: PIDData.REV_STOP,
                SV_OFF_DELAY: PIDData.SV_OFF_DELAY,
                F_SOURCE: PIDData.F_SOURCE,
                IMPACT_TIMES: PIDData.IMPACT_TIMES,
                IMPACT_LEVEL: PIDData.IMPACT_LEVEL,
                F_HOLD_UP: PIDData.F_HOLD_UP,
                PS_ACC_TIME: PIDData.PS_ACC_TIME,
                PS_DEC_TIME: PIDData.PS_DEC_TIME,
                PS_MODE: PIDData.PS_MODE,
                DA_TYPE: PIDData.DA_TYPE,
                PS_PID_MIN: PIDData.PS_PID_MIN,
                PS_SP_LIM: PIDData.PS_SP_LIM,
                DA_OFFSET_PLUS: PIDData.DA_OFFSET_PLUS,
                DA_OFFSET_MINUS: PIDData.DA_OFFSET_MINUS,
                DA_FULL_SCALE: PIDData.DA_FULL_SCALE,
                DA_LIM_PLUS: PIDData.DA_LIM_PLUS,
                DA_LIM_MINUS: PIDData.DA_LIM_MINUS,
                DA_ACC_TIME: PIDData.DA_ACC_TIME,
                DA_DEC_TIME: PIDData.DA_DEC_TIME,
                DA_MODE: PIDData.DA_MODE,
                KF: PIDData.KF,
                DF_SIGNAL: PIDData.DF_SIGNAL,
                STOP_MODE: PIDData.STOP_MODE,
                CYCLE_KI: PIDData.CYCLE_KI,
                CYCLE_RATE_MAX: PIDData.CYCLE_RATE_MAX,
                CYCLE_RATE_MIN: PIDData.CYCLE_RATE_MIN,
                SPEED_SIDE_KP: PIDData.SPEED_SIDE_KP,
                DF_START_RATE: PIDData.DF_START_RATE,
                AUTO_SIZE_KP: PIDData.AUTO_SIZE_KP,
                AUTO_SIDE_MAX: PIDData.AUTO_SIDE_MAX,
                AUTO_SIDE_MIN: PIDData.AUTO_SIDE_MIN,
                KP_N: PIDData.KP_N,
                IR_DC: PIDData.IR_DC,
                DA_LIM_P_V: PIDData.DA_LIM_P_V,
                DA_LIM_N_V: PIDData.DA_LIM_N_V,
                LOCK_RATE: PIDData.LOCK_RATE,
                PULSE_RATE: PIDData.PULSE_RATE,
                HALF_WAVE_RATIO: PIDData.HALF_WAVE_RATIO,
                MDR2_IR_F: PIDData.MDR2_IR_F,
                MDR2_KI: PIDData.MDR2_KI,
                SVON_HOLD_TIME: PIDData.SVON_HOLD_TIME,
                RUN_OUT_LIM_OFF: PIDData.RUN_OUT_LIM_OFF
            }

        );

    };

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
            pid,
            group
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
            <span style={{ marginBottom: '16px' }}>{t("PID BANK")}</span>
            <Select
                defaultValue={0}
                value={group}
                options={[
                    { label: 'RAM_PID_SHUTTLE', value: 0 },
                    { label: 'RAM_PID_PC', value: 1 },
                    { label: 'RAM_PID_PRE_LIFT', value: 2 },
                    { label: 'RAM_PID_PRE_SPEED', value: 3 },
                    { label: 'RAM_PID_TESTING', value: 4 },
                    { label: 'RAM_PID_RETURN', value: 5 },
                    { label: 'RAM_PID_TWIST1', value: 6 },
                    { label: 'RAM_PID_TWIST2', value: 7 },
                    { label: 'RAM_PID_CHANGE_SPEED', value: 8 },
                    { label: 'RAM_PID_POS_ABS_mm', value: 9 },
                    { label: 'RAM_PID_SIN_mm', value: 10 },
                    { label: 'RAM_PID_SIN_N', value: 11 },
                    { label: 'RAM_PID_POS_mm', value: 12 },
                    { label: 'RAM_PID_POS_N', value: 13 },
                    { label: 'RAM_PID_CYCLE_17_18_10', value: 14 },
                    { label: 'RAM_PID_AUTO_ZERO LOAD', value: 15 },
                    { label: 'RAM_PID_MOVE_M2', value: 16 },
                    { label: 'RAM_PID_TEST_M2', value: 17 },
                    { label: 'RAM_PID_RETURN_M2', value: 18 },
                    { label: 'RAM_PID_MOVE_M3', value: 19 },
                    { label: 'RAM_PID_TEST_M3', value: 20 },
                    { label: 'RAM_PID_21', value: 21 },
                    { label: 'RAM_PID_MOVE_M4', value: 22 },
                    { label: 'RAM_PID_PRE_SPEED_M4', value: 23 },
                    { label: 'RAM_PID_TEST_M4', value: 24 },
                    { label: 'RAM_PID_RETURN_M4', value: 25 },
                    { label: 'RAM_PID_26', value: 26 },
                    { label: 'RAM_PID_27', value: 27 },
                    { label: 'RAM_PID_28', value: 28 },
                    { label: 'RAM_PID_29', value: 29 },
                    { label: 'RAM_PID_30', value: 30 },
                    { label: 'RAM_PID_31', value: 31 },


                ]
                }
                onChange={value => setGroup(value)}
                style={{ width: 300, marginBottom: '16px' }}
                dropdownStyle={{ maxHeight: 1000 }}
            />

            <Row gutter={16}>
                {Object.keys(pid).map(key => (
                    <Col span={6} key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', marginRight: '16px' }}>
                            <label style={{ width: '60%' }}>{key}:</label>
                            <InputNumber
                                value={pid[key]}
                                onChange={value => handleChange(key, value)}
                                style={{ width: '40%' }}
                                size="small"
                                step={0.001}
                                precision={3}
                            />
                        </div>
                    </Col>
                ))}
            </Row>
        </Modal>
    );
};

export default PIDModal;