import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Table, message } from 'antd';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const ResultInfoTable = () => {
    const { t } = useTranslation();

    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([
        {
            title: t('methodName'),
            dataIndex: 'name',
            key: 'name',
        },
    ]);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Ref 用于保持最新状态（不依赖闭包）
    const loadingRef = useRef(false);
    const totalRef = useRef(0);
    const paginationRef = useRef(pagination);

    // 保持 paginationRef 是最新的
    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    // 请求数据
    const fetchData = useCallback(async (page, pageSize) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        const __channel = "report-message";
        const __type = "fetch-report-data";
        const payload = {
            __channel,
            __type,
            page,
            pageSize,
        };

        try {
            wsService.sendMessage(payload);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, response) => {
                PubSub.unsubscribe(token);
                loadingRef.current = false;

                // 更新 columns
                const updatedColumns = response.columns?.map(col => ({
                    title: () => {
                        if (col.startsWith('angle-') || col.startsWith('torque-')) {
                            const [type, value, cycleCountTmp] = col.split('-');
                            const title = type === 'torque' ? `循环[${cycleCountTmp}]扭力[${value}N]对应的角度值` : `循环[${cycleCountTmp}]角度[${value}]对应的扭矩值`;
                            return title;
                        }
                        else if (col.startsWith('stiffness-')) {
                            const [type, value1, value2, cycleCountTmp] = col.split('-');
                            const title = `循环[${cycleCountTmp}]扭转刚度[${value1}, ${value2}]`;
                            return title;
                        }
                        else {
                            return t(col);

                        }
                    },
                    dataIndex: col,
                    key: col,
                    ellipsis: true, // 超出内容加省略号
                    render: (value) => {
                        if (col.toLowerCase().includes("id")) {
                            return value;
                        }
                        // 如果是数字或可以转成数字，就保留三位小数
                        const num = parseFloat(value);
                        if (!isNaN(num)) {
                            return num.toFixed(3);
                        }
                        return value; // 否则原样返回
                    }
                })) || [];

                setColumns(updatedColumns);
                setData(response.data || []);
                totalRef.current = response.total;

                setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize,
                    total: response.total,
                }));
            });
        } catch (err) {
            loadingRef.current = false;
            message.error(err.message);
        }
    }, [t]);

    // 自动轮询 total 变化
    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize); // 初始化加载

        const intervalId = setInterval(() => {
            fetchData(pagination.current, pagination.pageSize); // 初始化加载

        }, 2000);

        return () => clearInterval(intervalId);
    }, [fetchData]);

    useEffect(() => {

        const __channel = "report-message";
        const __type = "fetch-report-data";
        const token = PubSub.subscribe(`${__channel}-${__type}`, (_, response) => {

            // 如果 total 改变了，重新加载第一页
            if (response.total !== totalRef.current) {
                totalRef.current = response.total;

                setPagination(prev => ({
                    ...prev,
                    current: 1,
                    total: response.total,
                }));

                fetchData(1, paginationRef.current.pageSize);
            }
            else {
                const newData = response.data || [];
                if (newData.length === 0)
                    return;
                if (data.length === 0)
                    return;
                const currentFirstRow = data[0];
                const newFirstRow = newData[0];
                const hasFirstRowChanged =
                    JSON.stringify(currentFirstRow) !== JSON.stringify(newFirstRow);
                if (hasFirstRowChanged) {
                    setPagination(prev => ({
                        ...prev,
                        current: 1,
                        total: response.total,
                    }));

                    fetchData(1, paginationRef.current.pageSize);
                }
            }
        });

        return () => {
            PubSub.unsubscribe(token);
        };
    }, [data]);

    // 表格翻页
    const handleTableChange = (newPagination) => {
        fetchData(newPagination.current, newPagination.pageSize);
    };

    return (
        <Table
            style={{ height: "100%" }}
            dataSource={data}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            loading={loadingRef.current}
            size='small'
            scroll={{ x: true, y: "15vh" }} // 设置滚动高度
            rowKey={(record, index) => index} // 根据实际数据设置唯一 rowKey 更好
        />
    );
};

export default ResultInfoTable;
