import PubSub from 'pubsub-js';

class WebSocketService {
    constructor(url) {
        if (!WebSocketService.instance) {
            this.url = url;
            this.socket = null;
            this.listeners = {};
            this.reconnectInterval = 5000; // 重连间隔时间（毫秒）
            WebSocketService.instance = this;
            this.connect(); // 自动调用connect方法
        }

        return WebSocketService.instance;
    }

    connect() {
        if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
            try {

                this.socket = new WebSocket(this.url);
                this.socket.onopen = () => {
                    console.log('WebSocket connection opened');
                };

                this.socket.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.notifyListeners(message);
                };

                this.socket.onclose = () => {
                    setTimeout(() => {
                        this.connect();
                    }, this.reconnectInterval);
                };

                this.socket.onerror = (error) => {
                    //  console.error('WebSocket error:', error);
                    this.socket.close(); // 触发onclose事件
                };
            }
            catch (error) {
            }

        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            // console.error('WebSocket is not open. Ready state:', this.socket.readyState);
        }
    }

    addListener(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    removeListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(listener => listener !== callback);
        }
    }

    notifyListeners(message) {
        const channel = message.__channel;
        if (channel) {
            PubSub.publish(channel, message);

            // 同时发布更细粒度的 `${channel}-${type}` 事件
            // 用于前端只订阅某一具体类型响应的场景（例如只关心 prepare-test 的完成回调）
            const type = message.__type;
            if (type) {
                PubSub.publish(`${channel}-${type}`, message);
            }
        }
    }
}

const instance = new WebSocketService('ws://127.0.0.1:20203');

export default instance;