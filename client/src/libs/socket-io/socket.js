// socket.js
import { io } from "socket.io-client";


const socket = io("http://localhost:3080", {
    autoConnect: true,
    transports: ["websocket"], // bisa ditambah untuk memperkuat koneksi
});

export default socket;
