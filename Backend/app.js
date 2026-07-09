import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./scr/features/auth/route/login.js";
import registerRoutes from "./scr/features/auth/route/register.js";
import projectRoutes from "./scr/features/project/project.route.js";
import documentRoutes from "./scr/features/document/document.route.js";
import aiRoutes from "./scr/features/ai/ai.route.js";
import complianceRoutes from "./scr/features/compliance/compliance.route.js";
import recommendationRoutes from "./scr/features/recommendation/recommendation.route.js";
import reportRoutes from "./scr/features/report/report.route.js";


import notFound from "./scr/middleware/notFound.middleware.js";
import errorHandler from "./scr/middleware/error.middleware.js";

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Data Centre Backend Running 🚀",
  });
});

// Feature Routes
app.use("/api/projects", projectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", registerRoutes);
// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;