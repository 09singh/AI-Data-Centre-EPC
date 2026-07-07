 import User from "../model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
 export const getlogin = async (req, res) => {
  try {
    const { email , password } = req.body;
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email provided",
      });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password provided",
      });
    }

    console.log("Entered password:", password);
    console.log("Database password:", user.password);
    console.log("REQ BODY:", req.body);
    console.log("PASSWORD:", password);
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({
      success: true,
      message: "Login successful",
      token: token,
      role: user.role
    });

  }
  catch (error) {
    console.log(error);
    console.log("FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
