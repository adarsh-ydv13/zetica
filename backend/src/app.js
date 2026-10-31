import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./router/auth.router.js";
import morgan from "morgan";
import cors from "cors";
import chatRouter from "./router/chat.router.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.get("/", (req, res) => {
    res.json({ message: "Nexora AI server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

export default app;