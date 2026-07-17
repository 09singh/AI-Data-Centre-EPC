import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "./scr/config/env.js";
import router from "./scr/routes/index.js";
import errorHandler  from "./scr/middleware/error.middleware.js";
import notFoundHandler from "./scr/middleware/notFound.middleware.js";
const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: " ECP backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;