import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // MongoDB Connection
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(" Server Failed to Start");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();