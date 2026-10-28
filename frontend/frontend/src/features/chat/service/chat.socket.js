import { io } from "socket.io-client";

let socket;

export const initializeSocketConnection = () => {
    socket = io("http://localhost:3000", {
        withCredentials: true
    });

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
    });

    return socket;
};












// import { io } from "socket.io-client";

// export const initializeSocketConnection = () => {

//     console.log("Initializing Socket.IO...");

//     const socket = io("http://localhost:3000", {
//         withCredentials: true
//     });

//     socket.on("connect", () => {
//         console.log("✅ Connected to Socket.IO server");
//         console.log("Socket ID:", socket.id);
//     });

//     socket.on("connect_error", (error) => {
//         console.error("❌ Socket connection error:", error.message);
//     });

//     return socket;
// };