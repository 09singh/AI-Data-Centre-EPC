import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/test-ai", async (req, res) => {
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/docs"
    );

    res.json({
      connected: true,
      aiResponse: response.data,
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message,
    });
  }
});

export default router;