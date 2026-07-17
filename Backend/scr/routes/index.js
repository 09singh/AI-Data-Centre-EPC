import express from "express";

import authRoutes from "../features/auth/route/index.js";
import aiRoutes from "../features/ai/ai.route.js";
import documentRoutes from "../features/document/document.route.js";
import projectRoutes from "../features/project/project.route.js";
import complianceRoutes from "../features/compliance/compliance.route.js";
import recommendationRoutes from "../features/recommendation/recommendation.route.js";
import reportRoutes from "../features/report/report.route.js";
import testRoutes from "./test.js";
import dashboardRoutes from "../features/dashboard/dashboard.route.js";
const router = express.Router();


// Auth
router.use("/auth", authRoutes);

// Domain routes
router.use("/documents", documentRoutes);
router.use("/projects", projectRoutes);
router.use("/compliance", complianceRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/reports", reportRoutes);
router.use("/test", testRoutes);
// AI routes
router.use("/ai", aiRoutes);

export default router;

