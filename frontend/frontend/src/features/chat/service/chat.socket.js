import { io } from "socket.io-client";

let socket;

export const initializeSocketConnection = () => {
    if (socket) {
        return socket;
    }

    socket = io("https://nexora-ai-backend-vcnd.onrender.com", {
        withCredentials: true,
        transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
    });

    return socket;
};