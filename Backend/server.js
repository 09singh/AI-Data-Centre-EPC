import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./scr/Features/auth/route/login.js";
import registerRoutes from "./scr/Features/auth/route/register.js";
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

//mongos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("connecteddb"))
    .catch((err) => console.log(err));

app.use(express.json());


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend is running. Send a POST request to /login.",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", registerRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});