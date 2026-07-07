import express from "express";
import bcrypt from "bcryptjs";
import User from "../model.js";
import { getregister } from "../controller/register.js";
const router = express.Router();
router.post("/register", getregister);
export default router;