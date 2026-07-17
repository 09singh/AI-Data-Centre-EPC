import express from "express";

import loginRoute from "./login.js";
import registerRoute from "./register.js";

const router = express.Router();

router.use("/login", loginRoute);
router.use("/register", registerRoute);

export default router;

