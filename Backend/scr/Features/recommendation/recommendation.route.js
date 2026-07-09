import express from "express";
import * as controller from "./recommendation.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, controller.generateRecommendations);

router.get("/", auth, controller.getRecommendations);

router.get("/:id", auth, controller.getRecommendation);

router.patch("/:id/status", auth, controller.updateStatus);

export default router;