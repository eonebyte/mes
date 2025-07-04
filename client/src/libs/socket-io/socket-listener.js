import { notification } from 'antd';
import socket from './socket';

function setupSocketListeners(store) {
    if (socket.hasListeners) return; // ❗️prevent duplicate listeners

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });

    socket.on("refreshFetchData", (data = {}) => {
        console.log("Socket received data:", data);
        if (data) {
            notification.info({
                message: 'Data Updated',
                description: data.message || 'Received real-time update from server',
            });

            // Dispatch Redux action, if you want to update global state
            store?.dispatch({ type: 'DATA_SHOULD_REFRESH' });
        }   
    });

    socket.hasListeners = true;
}

export default setupSocketListeners;
