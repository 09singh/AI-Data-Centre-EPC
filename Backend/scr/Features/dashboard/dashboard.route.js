import express from "express";
import auth from "../../middleware/auth.middleware.js";
import * as controller from "./dashboard.controller.js";

const router = express.Router();

// Protected Dashboard
router.get("/", auth, controller.getDashboard);

export default router;

