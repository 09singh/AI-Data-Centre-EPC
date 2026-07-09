import express from "express";
import * as controller from "./document.controller.js";
import upload from "../../middleware/upload.middleware.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, upload.single("file"), controller.uploadDocument);

router.get("/", auth, controller.getDocuments);

router.get("/:id", auth, controller.getDocument);

router.delete("/:id", auth, controller.deleteDocument);

export default router;