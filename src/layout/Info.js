import React from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { useTranslation } from "react-i18next";

import "../styles/layout.css";

const Info = ({ statusData }) => {

    const { t } = useTranslation();

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
