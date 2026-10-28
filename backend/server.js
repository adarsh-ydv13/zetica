import dotenv from "dotenv";
import app from "./src/app.js"
import connectDB from "./src/config/database.js"
import http from "http"
import { initSocket } from "./src/sockets/server.socket.js";

dotenv.config();

const httpServer=http.createServer(app)

initSocket(httpServer)

async function startServer() {
  try {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not configured");
    }

    await connectDB();
    httpServer.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
    // testAi();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();