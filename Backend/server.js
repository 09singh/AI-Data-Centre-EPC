import dotenv from "dotenv";
dotenv.config();

import app from "../Backend/app.js";
import connectDB from "./scr/config/db.js";
import { env } from "./scr/config/env.js";



const startServer = async () => {
  try {
    await connectDB();

    console.log("MongoDB Connected");

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
    

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();