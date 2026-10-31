import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
    const allowedOrigins = [
        "http://localhost:5173",
        process.env.FRONTEND_URL
    ].filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    console.log("Socket.IO server is running");

    io.on("connection", (socket) => {
        console.log("A user is connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
        });
    });
}

export function getIo() {
    if (!io) {
        throw new Error("Socket.IO is not initialized");
    }

    return io;
}