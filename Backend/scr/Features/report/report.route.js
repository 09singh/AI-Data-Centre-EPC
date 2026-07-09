import express from "express";
import * as controller from "./report.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, controller.generateReport);

router.get("/", auth, controller.getReports);

router.get("/:id", auth, controller.getReport);

router.delete("/:id", auth, controller.deleteReport);

export default router;