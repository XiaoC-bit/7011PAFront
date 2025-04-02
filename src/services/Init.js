import { useEffect } from 'react';
import PubSub from 'pubsub-js';
import wsService from '../services/WebSocketService';
import { useAtom } from 'jotai';
import { formState } from '../data/Data';

const snakeToCamel = (str) => {
    return str.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
};

const transformDataKeys = (data) => {
    const newItem = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            newItem[snakeToCamel(key)] = data[key];
        }
    }
    return newItem;
};

const useLoadDefaultMethod = () => {
    const [_, setFormData] = useAtom(formState);

    useEffect(() => {

        const loadDefaultMethod = async () => {
            const __channel = "config-method-message";
            const __type = "fetchDetail";
            const data = {
                "__channel": __channel,
                "__type": __type,
                "key": 0
            };

            wsService.sendMessage(data);

            const response = await new Promise((resolve, reject) => {
                const token = PubSub.subscribe(__channel + "-" + __type, (_, data) => {
                    PubSub.unsubscribe(token);
                    if (data.status === 'success') {
                        resolve(data);
                    } else {
                        reject(new Error('loadDefaultMethod Failed'));
                    }
                });
            });

            const transformedData = transformDataKeys(response.data[0]);

            setFormData((prevState) => ({
                ...prevState,
                configForm: transformedData,
                testModeConfig: transformedData
            }));
        };

        loadDefaultMethod();
    }, [setFormData]);
};

export default useLoadDefaultMethod;