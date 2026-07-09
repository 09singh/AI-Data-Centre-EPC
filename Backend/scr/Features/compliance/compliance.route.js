import express from "express";
import * as controller from "./compliance.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, controller.generateCompliance);

router.get("/", auth, controller.getComplianceReports);

router.get("/:id", auth, controller.getComplianceReport);

export default router;