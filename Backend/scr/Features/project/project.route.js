import express from "express";
import * as controller from "./project.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, controller.createProject);

router.get("/", auth, controller.getProjects);

router.get("/:id", auth, controller.getProject);

router.put("/:id", auth, controller.updateProject);

router.delete("/:id", auth, controller.deleteProject);

export default router;