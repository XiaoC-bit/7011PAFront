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
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                console.log('WebSocket connection opened');
            };

            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.notifyListeners(message);
            };

            this.socket.onclose = () => {
                console.log('WebSocket connection closed, attempting to reconnect...');
                setTimeout(() => {
                    this.connect();
                }, this.reconnectInterval);
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.socket.close(); // 触发onclose事件
            };
        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open. Ready state:', this.socket.readyState);
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
        const event = message.__channel;
        if (event) {
            PubSub.publish(event, message);
        }
    }
}

const instance = new WebSocketService('ws://127.0.0.1:20203');

export default instance;