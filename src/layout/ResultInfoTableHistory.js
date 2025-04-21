import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Table, message } from 'antd';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';

const ResultInfoHistoryTable = ({ req_queue_id, method }) => {
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
        pageSize: 5,
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
    const fetchData = async (page, pageSize) => {
        if (req_queue_id === undefined || method === undefined)
            return;
        if (loadingRef.current) return;

        loadingRef.current = true;
        const __channel = "report-message";
        const __type = "fetch-report-history-data";
        const payload = {
            __channel,
            __type,
            page,
            pageSize,
            req_queue_id: req_queue_id,
            method: method,
        };

        try {
            wsService.sendMessage(payload);

            const token = PubSub.subscribe(`${__channel}-${__type}`, (_, response) => {
                PubSub.unsubscribe(token);
                loadingRef.current = false;

                // 更新 columns
                const updatedColumns = response.columns?.map(col => ({
                    title: t(col),
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
    };

    // 自动轮询 total 变化
    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize); // 初始化加载

        // const intervalId = setInterval(() => {
        //     const __channel = "report-message";
        //     const __type = "fetch-report-data";
        //     const payload = {
        //         __channel,
        //         __type,
        //         page: paginationRef.current.current,
        //         pageSize: paginationRef.current.pageSize,
        //     };

        //     wsService.sendMessage(payload);

        //     const token = PubSub.subscribe(`${__channel}-${__type}`, (_, response) => {
        //         PubSub.unsubscribe(token);

        //         // 如果 total 改变了，重新加载第一页
        //         if (response.total !== totalRef.current) {
        //             totalRef.current = response.total;

        //             setPagination(prev => ({
        //                 ...prev,
        //                 current: 1,
        //                 total: response.total,
        //             }));

        //             fetchData(1, paginationRef.current.pageSize);
        //         }
        //     });
        // }, 2000);

        // return () => clearInterval(intervalId);
    }, [method, req_queue_id]);

    // 表格翻页
    const handleTableChange = (newPagination) => {
        fetchData(newPagination.current, newPagination.pageSize);
    };

    return (
        <Table
            dataSource={data}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            loading={loadingRef.current}
            size='small'
            scroll={{ x: true }} // 设置滚动高度
            rowKey={(record, index) => index} // 根据实际数据设置唯一 rowKey 更好
        />
    );
};

export default ResultInfoHistoryTable;
