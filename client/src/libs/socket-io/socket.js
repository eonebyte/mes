// socket.js
import { io } from "socket.io-client";


const socket = io(import.meta.env.VITE_BACKEND_URL, {
    autoConnect: true,
    transports: ["websocket"], // bisa ditambah untuk memperkuat koneksi
});

export default socket;
