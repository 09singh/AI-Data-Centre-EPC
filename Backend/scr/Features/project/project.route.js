import express from "express";
import * as controller from "./project.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, controller.createProject);

router.get("/", controller.getProjects);

router.get("/:id/schedule", controller.getProjectSchedule);
router.get("/:id/vendors", controller.getProjectVendors);
router.get("/:id/equipment", controller.getProjectEquipment);
router.get("/:id/commissioning", controller.getProjectCommissioning);
router.get("/:id/reports", controller.getProjectReports);
router.get("/:id", controller.getProject);

router.put("/:id", auth, controller.updateProject);

router.delete("/:id", auth, controller.deleteProject);

export default router;
