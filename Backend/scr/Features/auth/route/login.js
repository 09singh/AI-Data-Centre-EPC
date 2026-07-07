import express from "express";
import User from "../model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getlogin } from "../controller/login.js";
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
router.post("/login", getlogin);
export default router;