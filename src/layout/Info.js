import React, { useState } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { useTranslation } from "react-i18next";

import PubSub from 'pubsub-js';
import "../styles/layout.css";

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

    const token = PubSub.subscribe("normal-message-real-data", (_, data) => {
        PubSub.unsubscribe(token);

        if (data.connectErr === false) {
            setStatusData({
                torque: data.torque,
                angle: data.angle,
                axialDisplacement: data.axialDisplacement,
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


    return (
        <Row className='info' gutter={16} >
            <Col span={4}>
                <div className="statistic-item">
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
