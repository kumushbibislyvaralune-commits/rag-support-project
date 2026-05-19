const express = require("express");
const { registerUser, loginUser } = require("../services/auth.service");

const router = express.Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    res.json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;