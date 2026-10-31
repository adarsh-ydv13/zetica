import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./router/auth.router.js";
import morgan from "morgan";
import cors from "cors";
import chatRouter from "./router/chat.router.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "https://zetica.netlify.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Nexora AI Backend is running",
    success: true,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

export default app;