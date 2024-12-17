import React from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { useTranslation } from "react-i18next";

import "../styles/layout.css";

const Info = ({ statusData }) => {

    const { t } = useTranslation();

    return (
        <Row className='info' gutter={16} >
            <Col span={4}>
                <Statistic
                    title={t("torque")}
                    value={statusData.torque + " N.m"}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Col>
            <Col span={4}>
                <Statistic
                    title={t("angle")}
                    value={statusData.angle + " deg"}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Col>
            <Col span={4}>
                <Statistic
                    title={t("axisal displacement")}
                    value={statusData.axialDisplacement + " mm"}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Col>
            <Col span={4}>
                <Statistic
                    title={t("twist count")}
                    value={statusData.twistCount}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Col>
            <Col span={8}>
                <Statistic
                    title={t("test time")}
                    value={statusData.testTime}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Col>
        </Row>
    );
};



export default Info;
