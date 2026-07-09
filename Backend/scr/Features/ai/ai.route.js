import express from "express";
import * as controller from "./ai.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/health", auth, controller.health);

router.post("/chat", auth, controller.chat);

router.post("/search", auth, controller.search);

router.post("/compliance", auth, controller.compliance);

router.post("/recommendation", auth, controller.recommendation);

router.post("/reports", auth, controller.report);

export default router;