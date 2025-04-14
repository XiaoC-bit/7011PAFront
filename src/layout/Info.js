import React, { useEffect, useState } from 'react';
import { Row, Col, Statistic, Card, message } from 'antd';
import { useTranslation } from "react-i18next";

import PubSub from 'pubsub-js';
import "../styles/layout.css";
import wsService from '../services/WebSocketService';

const Info = () => {

    const { t } = useTranslation();
    const sampleData = {
        torque: 120,
        angle: 45,
        axialDisplacement: 10,
        twistCount: 5,
        testTime: '01:15:30', // 测试时间格式
    };

    const [statusData, setStatusData] = useState({
        torque: 120,
        angle: 45,
        axialDisplacement: 10,
        twistCount: 5,
        testTime: '01:15:30', // 测试时间格式
    });

    useEffect(() => {
        const token = PubSub.subscribe("normal-message-real-data", (_, data) => {
            //PubSub.unsubscribe(token);
            if (data.connectErr === false) {
                console.log("正常数据", data);
                setStatusData({
                    torque: Math.round(data.torque * 1000) / 1000,
                    angle: Math.round(data.angle * 1000) / 1000,
                    axialDisplacement: Math.round(data.axialDisplacement * 1000) / 1000,
                    twistCount: data.twistCount,
                    testTime:
                        String(Math.floor(data.testTimer / 3600)).padStart(2, "0") +
                        ":" +
                        String(Math.floor(data.testTimer / 60) % 60).padStart(2, "0") +
                        ":" +
                        String(Math.floor(data.testTimer % 60)).padStart(2, "0")


                });


            }
            else {
                //通讯失败
            }
        });
    }, []);


    const handleZero = async () => {
        try {
            const __channel = "control-message";
            const __type = "zero";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                if (data.status === 'success') {
                    // message.success(t('home success'));
                } else {
                    message.error(t('home failed'));
                }
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };


    return (
        <Row className='info' gutter={16} >
            <Col span={4}>
                <div className="statistic-item"
                    onDoubleClick={() => {
                        handleZero();
                    }}
                >
                    <span className="statistic-title">{t("torque")}</span>
                    <Statistic
                        value={statusData.torque + " N.m"}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </div>
            </Col>
            <Col span={4}>

                <div className="statistic-item">
                    <span className="statistic-title">{t("angle")}</span>
                    <Statistic
                        value={statusData.angle + " deg"}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </div>
            </Col>
            <Col span={4}>

                <div className="statistic-item">
                    <span className="statistic-title">{t("axisal displacement")}</span>
                    <Statistic
                        value={statusData.axialDisplacement + " mm"}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </div>
            </Col>
            <Col span={4}>
                <div className="statistic-item">
                    <span className="statistic-title">{t("twist count")}</span>
                    <Statistic
                        value={statusData.twistCount}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </div>
            </Col>
            <Col span={4}>
                <div className="statistic-item">
                    <span className="statistic-title">{t("test time")}</span>
                    <Statistic
                        value={statusData.testTime}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </div>
            </Col>
        </Row>
    );
};



export default Info;
