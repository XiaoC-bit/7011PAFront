import React, { useEffect } from 'react';
import { Row, Col, message } from 'antd';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const ResultInfoTable = () => {
    const { t } = useTranslation();

    const [data, setData] = React.useState([]);
    // const data = [
    //     { key: '1', label: t('maxTorque'), value: '100 Nm' },
    //     { key: '2', label: t('maxAngle'), value: '45°' },
    //     { key: '3', label: t('torsionalStiffness'), value: '200 Nm/°' },
    // ];

    // 设置列数
    const colsPerRow = 4;


    const fetchData = async () => {
        try {
            const __channel = "report-message";
            const __type = "fetch-report-data";
            const data = {
                "__channel": __channel,
                "__type": __type,
            };

            wsService.sendMessage(data);

            const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                PubSub.unsubscribe(token);
                setData(data.data);
                if (data.status === 'success') {
                    //message.success(t('spin success'));
                } else {

                }
            });

        } catch (error) {
            message.error(error.message);
        } finally {
        }
    };


    useEffect(() => {



        fetchData();
        const intervalId = setInterval(fetchData, 2000);

        return () => clearInterval(intervalId); // 清除定时器
    }, []);


    return (
        <div style={{ padding: 20 }}>
            <Row gutter={0}>
                {data.map((item, index) => (
                    <Col span={24 / colsPerRow} key={index}>
                        <div
                            style={{
                                border: '1px solid #ddd',  // 边框颜色
                                padding: '8px',            // 内边距增加，使内容不紧凑
                                backgroundColor: '#fff',   // 背景颜色可以是白色，像表格一样
                                textAlign: 'left',         // 文字左对齐
                            }}
                        >
                            <strong>{t(item.name)}:</strong> {parseFloat(item.data).toFixed(3)}
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ResultInfoTable;
